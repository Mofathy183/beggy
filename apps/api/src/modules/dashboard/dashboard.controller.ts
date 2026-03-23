import type { Request, Response } from 'express';
import type { DashboardService } from '@modules/dashboard';
import type { DashboardOverviewDto } from '@beggy/shared/types';
import { apiResponseMap } from '@shared/utils';
import { BaseController } from '@shared/core';
import { logger } from '@shared/middlewares';
import { STATUS_CODE } from '@shared/constants';

/**
 * HTTP controller responsible for dashboard endpoints.
 *
 * @description
 * Orchestrates request handling and delegates aggregation
 * to DashboardService. Returns a single pre-shaped payload
 * ready for direct UI consumption.
 *
 * @remarks
 * - Contains no business or aggregation logic.
 * - Assumes `requireAuth` middleware has run and populated `req.user`.
 */
export class DashboardController extends BaseController {
	constructor(private readonly dashboardService: DashboardService) {
		super(
			logger.child({
				domain: 'dashboard',
				controller: 'DashboardController',
			})
		);
	}

	/**
	 * GET /dashboard
	 *
	 * @description
	 * Returns the full dashboard overview for the authenticated user,
	 * including profile state, item stats, recent items, and category
	 * distribution in a single aggregated response.
	 *
	 * @route GET /dashboard
	 */
	getDashboardOverview = async (
		req: Request,
		res: Response
	): Promise<void> => {
		this.assertAuthenticated(req);
		const userId = req.user.id;

		const overview =
			await this.dashboardService.getDashboardOverview(userId);

		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok<DashboardOverviewDto>(
				overview,
				'DASHBOARD_OVERVIEW_RETRIEVED'
			)
		);
	};
}

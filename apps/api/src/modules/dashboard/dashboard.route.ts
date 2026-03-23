/**
 * 📊 DASHBOARD — Aggregated Overview Endpoint
 *
 * The Dashboard domain provides a single pre-aggregated payload
 * optimized for the dashboard UI. It composes data from multiple
 * domains (profile, items) into one response to avoid UI-side
 * request waterfall.
 *
 * ------------------------------------------------------------------
 * Core Dashboard Endpoints (Authenticated)
 * ------------------------------------------------------------------
 *
 * GET /dashboard
 * - Returns the full dashboard overview for the authenticated user.
 * - Aggregates:
 *   - Profile state (onboarding completion)
 *   - Item stats (total count, fragile count)
 *   - Recent items (last 5, lightweight projection)
 *   - Category distribution (grouped counts)
 *
 * This endpoint is optimized for:
 * - Dashboard page initial load (single round-trip)
 * - Skeleton/loading state hydration
 * - AI recommendation preprocessing (future)
 *
 * Only returns data owned by the authenticated user.
 *
 * ------------------------------------------------------------------
 * Future Sections (planned, not yet implemented)
 * ------------------------------------------------------------------
 *
 * Bags section:
 *   - Total bags, recent bags, capacity summaries
 *
 * Weather section:
 *   - Current conditions for the user's saved travel location
 *
 * Recommendations section:
 *   - AI-generated packing suggestions based on profile + items
 */
import { Router } from 'express';

import { Action, Subject } from '@prisma-generated/enums';
import type { DashboardController } from '@modules/dashboard';
import { requireAuth, requirePermission } from '@shared/middlewares';

export const createDashboardRouter = (
	dashboardController: DashboardController
): Router => {
	const router = Router();

	/**
	 * GET /dashboard
	 * Returns the full aggregated dashboard overview.
	 */
	router.get(
		'/',
		requireAuth,
		requirePermission(Action.READ, Subject.DASHBOARD),
		dashboardController.getDashboardOverview
	);

	return router;
};

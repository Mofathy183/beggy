/**
 * 🧳 BAGS — Travel Bag Containers
 *
 * @description
 * The Bags domain represents physical travel bags owned by users.
 *
 * A bag is the primary packing container in Beggy. It holds items,
 * tracks weight and volume against physical constraints, and provides
 * a real-time derived status so users always know where they stand.
 *
 * Bags are:
 * - User-owned (private by default)
 * - Backed by a Container record (physical constraints live there)
 * - Enriched with computed metrics and status at response time
 *
 * Bags answer the question:
 * "What are you carrying — and can it all fit?"
 *
 * ------------------------------------------------------------------
 * Core Bag Management (Authenticated)
 * ------------------------------------------------------------------
 *
 * @route GET /bags
 *
 * @remarks
 * - Returns a paginated list of the authenticated user's bags
 * - Supports:
 *   - Pagination (page, limit)
 *   - Ordering (orderBy, direction)
 *   - Filtering:
 *     - type (BagType enum)
 *     - size (Size enum)
 *     - material (Material enum)
 *     - color
 *     - maxCapacity / maxWeight (numeric range)
 *     - createdAt (date range)
 *
 * Each bag in the list includes a computed ContainerStatusDTO
 * (metrics + state) so the UI can render progress bars and
 * warning indicators without additional requests.
 *
 * ------------------------------------------------------------------
 *
 *  @route GET /bags/:id
 *
 * @remarks
 * - Returns a single bag by ID
 * - Requires ownership
 *
 * Returns 404 if the bag does not exist
 * or does not belong to the authenticated user.
 *
 * ------------------------------------------------------------------
 *
 * @route POST /bags
 *
 * @remarks
 * - Creates a new bag + its backing container atomically
 * - Required:
 *   - name
 *   - type (BagType)
 *   - size (Size)
 *   - maxCapacity
 *   - maxWeight
 *
 * Optional:
 *   - color (defaults to "black")
 *   - material
 *   - features (BagFeature[])
 *
 * Physical measurements are required to:
 * - Enable packing validation
 * - Power smart packing recommendations
 *
 * ------------------------------------------------------------------
 *
 * @route PATCH /bags/:id
 *
 * @remarks
 * - Partially updates a user-owned bag
 * - Routes maxCapacity / maxWeight updates to the Container record
 * - Routes cosmetic updates to the Bag record
 * - Both happen atomically
 *
 * PATCH semantics prevent accidental data overwrites.
 *
 * ------------------------------------------------------------------
 *
 * @route DELETE /bags/:id
 *
 * @remarks
 * - Deletes a bag + its backing container (cascade)
 * - All ContainerItems for this bag are also removed
 * - Intended for bag management and inventory cleanup
 *
 * ------------------------------------------------------------------
 */
/**
 * 🧳 Bags Router
 *
 * @description
 * Defines HTTP routes for the Bags domain and composes the middleware
 * pipeline (authentication, authorization, validation, query preparation).
 *
 * @remarks
 * - Controllers are assumed to be side-effect free and rely on validated input.
 * - All routes require authentication and are scoped to the current user.
 * - Validation schemas act as the contract between client and API.
 */
import { Router } from 'express';

import { Action, Subject } from '@beggy/shared/constants';
import {
	BagSchema,
	QuerySchema,
	OrderByQuerySchemas,
} from '@beggy/shared/schemas';

import type { BagController } from '@modules/bags';
import {
	requireAuth,
	requirePermission,
	prepareListQuery,
	validateBody,
	validateUuidParam,
	validateQuery,
} from '@shared/middlewares';

/**
 * Creates and configures the Bags router.
 *
 * @param bagController - Controller handling bag-related operations
 * @returns Configured Express router
 */
export const createBagRouter = (bagController: BagController): Router => {
	const router = Router();

	/**
	 * GET /bags
	 *
	 * @description
	 * Returns a paginated list of bags owned by the authenticated user.
	 *
	 * @remarks
	 * - Query params are normalized via `prepareListQuery`
	 * - Filtering and ordering are validated against shared schemas
	 */
	router.get(
		'/',
		requireAuth,
		requirePermission(Action.READ, Subject.BAG),
		prepareListQuery({
			orderBySchema: OrderByQuerySchemas.bagOrderBy,
		}),
		validateQuery(QuerySchema.bagFilter),
		bagController.getBags
	);

	/**
	 * GET /bags/:id
	 *
	 * @description
	 * Returns a single bag if it belongs to the authenticated user.
	 *
	 * @remarks
	 * - UUID param is validated before reaching the controller
	 */
	router.get(
		'/:id',
		requireAuth,
		requirePermission(Action.READ, Subject.BAG),
		validateUuidParam,
		bagController.getBagById
	);

	/**
	 * POST /bags
	 *
	 * @description
	 * Creates a new bag and its backing container.
	 *
	 * @remarks
	 * - Request body is validated against `BagSchema.create`
	 * - Operation is expected to be atomic at the service layer
	 */
	router.post(
		'/',
		requireAuth,
		requirePermission(Action.CREATE, Subject.BAG),
		validateBody(BagSchema.create),
		bagController.createBag
	);

	/**
	 * PATCH /bags/:id
	 *
	 * @description
	 * Partially updates a bag and/or its container constraints.
	 *
	 * @remarks
	 * - Uses PATCH semantics (partial updates only)
	 * - Validation ensures only allowed fields are passed
	 */
	router.patch(
		'/:id',
		requireAuth,
		requirePermission(Action.UPDATE, Subject.BAG),
		validateUuidParam,
		validateBody(BagSchema.update),
		bagController.updateBag
	);

	/**
	 * DELETE /bags/:id
	 *
	 * @description
	 * Deletes a bag and cascades removal to related container data.
	 *
	 * @remarks
	 * - Intended for user-level cleanup operations
	 */
	router.delete(
		'/:id',
		requireAuth,
		requirePermission(Action.DELETE, Subject.BAG),
		validateUuidParam,
		bagController.deleteBagById
	);

	return router;
};

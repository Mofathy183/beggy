/**
 * 📦 ITEMS — Reusable Packing Objects
 *
 * The Items domain represents physical objects that can be
 * packed into containers such as bags and suitcases.
 *
 * Items are:
 * - User-owned (private by default)
 * - Reusable across multiple containers
 * - Measured using structured physical constraints (weight, volume)
 * - Independent from container placement logic
 *
 * Items answer the question:
 * "What exactly are you packing?"
 *
 * ------------------------------------------------------------------
 * Core Item Management (Authenticated)
 * ------------------------------------------------------------------
 *
 * GET /items
 * - Returns a paginated list of the authenticated user's items
 * - Supports:
 *   - Pagination (page, limit)
 *   - Ordering (orderBy, direction)
 *   - Filtering:
 *     - category
 *     - isFragile
 *     - weight / volume ranges
 *     - color
 *
 * This endpoint is optimized for:
 * - Inventory views
 * - Item selection modals
 * - AI recommendation preprocessing
 *
 * Only returns items owned by the authenticated user.
 *
 * ------------------------------------------------------------------
 *
 * GET /items/:id
 * - Returns a single item by ID
 * - Requires ownership
 *
 * Designed for:
 * - Item detail views
 * - Editing workflows
 * - Container packing selection
 *
 * Returns 404 if the item does not exist
 * or does not belong to the authenticated user.
 *
 * ------------------------------------------------------------------
 *
 * POST /items
 * - Creates a new reusable item
 * - Requires:
 *   - name
 *   - category
 *   - quantity
 *   - weight + weightUnit
 *   - volume + volumeUnit
 *
 * Optional:
 *   - color (defaults to "black")
 *   - isFragile (defaults to false)
 *
 * Designed for:
 * - Manual inventory building
 * - AI-assisted item creation
 * - Import flows (future)
 *
 * Physical measurements are required to:
 * - Enable container capacity validation
 * - Power smart packing recommendations
 *
 * ------------------------------------------------------------------
 *
 * PATCH /items/:id
 * - Updates an existing item (partial update)
 * - Only mutable physical and descriptive fields
 * - Does NOT allow ownership changes
 *
 * Supports safe incremental edits from:
 * - Item detail pages
 * - Inline edit UIs
 * - Bulk adjustment tools (future)
 *
 * PATCH semantics prevent accidental data overwrites.
 *
 * ------------------------------------------------------------------
 *
 * DELETE /items/:id
 * - Deletes a single item owned by the user
 * - Intended for inventory cleanup
 *
 * If the item is currently packed into containers,
 * deletion behavior should be handled explicitly
 * (soft delete or relational integrity enforcement).
 *
 * ------------------------------------------------------------------
 * ------------------------------------------------------------------
 *
 * GET /items/library
 * - Returns system-defined items (userId = null)
 * - Accessible to authenticated users
 * - Used for:
 *   - Quick-add templates
 *   - AI suggestion baselines
 *   - Starter packing kits
 *
 * Library items are read-only.
 */
import { Router } from 'express';

import { Action, Subject } from '@beggy/shared/constants';
import {
	ItemSchema,
	QuerySchema,
	OrderByQuerySchemas,
} from '@beggy/shared/schemas';

import type { ItemController } from '@modules/items';
import {
	requireAuth,
	requirePermission,
	prepareListQuery,
	validateBody,
	validateUuidParam,
	validateQuery,
} from '@shared/middlewares';

export const createItemRouter = (itemController: ItemController): Router => {
	const router = Router();
	/**
	 * GET /items
	 * Returns paginated items owned by the authenticated user.
	 */
	router.get(
		'/',
		requireAuth,
		requirePermission(Action.READ, Subject.ITEM),
		prepareListQuery({
			orderBySchema: OrderByQuerySchemas.itemOrderBy,
		}),
		validateQuery(QuerySchema.itemFilter),
		itemController.getItems
	);

	/**
	 * GET /items/:id
	 * Returns a single user-owned item.
	 */
	router.get(
		'/:id',
		requireAuth,
		requirePermission(Action.READ, Subject.ITEM),
		validateUuidParam,
		itemController.getItemById
	);

	/**
	 * POST /items
	 * Creates a new reusable item.
	 */
	router.post(
		'/',
		requireAuth,
		requirePermission(Action.CREATE, Subject.ITEM),
		validateBody(ItemSchema.create),
		itemController.createItem
	);

	/**
	 * PATCH /items/:id
	 * Applies partial updates to a user-owned item.
	 */
	router.patch(
		'/:id',
		requireAuth,
		requirePermission(Action.UPDATE, Subject.ITEM),
		validateUuidParam,
		validateBody(ItemSchema.update),
		itemController.updateItem
	);

	/**
	 * DELETE /items/:id
	 * Deletes a user-owned item.
	 */
	router.delete(
		'/:id',
		requireAuth,
		requirePermission(Action.DELETE, Subject.ITEM),
		validateUuidParam,
		itemController.deleteItemById
	);

	return router;
};

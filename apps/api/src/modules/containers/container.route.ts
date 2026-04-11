/**
 * 📦 CONTAINERS (Packing) — Container State & Item Orchestration
 *
 * The Containers domain is responsible for:
 * - Managing item placement within containers (bags, suitcases, etc.)
 * - Enforcing packing constraints (weight, capacity)
 * - Computing derived container state (metrics, status, reasons)
 * - Handling item transitions (pack, unpack, move)
 *
 * Containers answer the question:
 * "Where are my items, and what is the current state of each container?"
 *
 * ------------------------------------------------------------------
 * Container State (Read Model)
 * ------------------------------------------------------------------
 *
 * GET /containers/:id/state
 * - Returns the full, UI-ready container snapshot
 * - Includes:
 *   - Packed items
 *   - Computed metrics (weight, capacity, percentages)
 *   - Constraint state (overweight, full, etc.)
 *   - Derived status + reasons
 *
 * This endpoint is the single source of truth for rendering a container.
 *
 * ------------------------------------------------------------------
 * Item Placement (Mutations)
 * ------------------------------------------------------------------
 *
 * POST /containers/:id/pack
 * - Adds an item to a container
 * - Increases quantity if item already exists
 * - Recomputes container state after mutation
 *
 * POST /containers/:id/unpack
 * - Removes an item (or reduces quantity) from a container
 * - Removes entry entirely if quantity reaches zero
 * - Recomputes container state after mutation
 *
 * Both endpoints:
 * - Operate on a single container
 * - Return a minimal container snapshot for UI updates
 *
 * ------------------------------------------------------------------
 * Item Transfer (Atomic Operation)
 * ------------------------------------------------------------------
 *
 * POST /containers/move
 * - Moves an item between two containers
 * - Atomic operation (remove from source + add to destination)
 * - Prevents no-op moves (same source and destination)
 *
 * Returns:
 * - Source container (after removal)
 * - Destination container (after addition)
 *
 * This allows the frontend to update both containers in one request.
 *
 * ------------------------------------------------------------------
 * Validation & Consistency
 * ------------------------------------------------------------------
 *
 * - All inputs are validated via shared Zod schemas
 * - Validation rules are consistent across API and frontend
 * - Strict schemas prevent unexpected payloads
 *
 * ------------------------------------------------------------------
 * Authorization Model
 * ------------------------------------------------------------------
 *
 * - All routes require authentication
 * - Permissions are enforced on the CONTAINER subject
 *
 * Actions:
 * - READ   → view container state
 * - UPDATE → pack, unpack, move items
 *
 * The API is container-centric:
 * - Operations are defined on the container abstraction
 * - Independent of specific types (bag, suitcase)
 *
 * ------------------------------------------------------------------
 * Design Notes
 * ------------------------------------------------------------------
 *
 * - Containers act as an aggregate boundary for item placement
 * - All mutations recompute derived state (no partial updates)
 * - Responses are optimized for UI consumption (no extra queries needed)
 * - Separation of concerns:
 *   - Validation → schema layer
 *   - Authorization → middleware
 *   - Business logic → controller/service
 */
import { Router } from 'express';
import { ContainerSchema } from '@beggy/shared/schemas';
import type { ContainerController } from '@modules/containers';
import {
	requireAuth,
	requirePermission,
	validateBody,
	validateUuidParam,
} from '@shared/middlewares';
import { Action, Subject } from '@prisma-generated/enums';

/**
 * Creates the Express router for container-related endpoints.
 *
 * @param controller - Container controller handling request execution
 * @returns Configured Express router
 *
 * @remarks
 * This function acts as the composition root for the Containers API module.
 * It wires routes with their required middleware for:
 * - Authentication (requireAuth)
 * - Authorization (requirePermission)
 * - Input validation (Zod schemas)
 *
 * Controllers are expected to receive only validated and authorized requests.
 */
export const createContainerRouter = (
	controller: ContainerController
): Router => {
	const router = Router();

	/**
	 * @route GET /containers/:id/state
	 *
	 * Retrieves the full container state (items, metrics, status).
	 *
	 * @remarks
	 * - Requires authenticated user
	 * - Requires READ permission on CONTAINER
	 * - Validates `:id` as UUID
	 */
	router.get(
		'/:id/state',
		requireAuth,
		requirePermission(Action.READ, Subject.CONTAINER),
		validateUuidParam,
		controller.getContainerState
	);

	/**
	 * @route POST /containers/:id/pack
	 *
	 * Packs an item into a container.
	 *
	 * @remarks
	 * - Requires UPDATE permission on CONTAINER
	 * - Validates request body using ContainerSchema.pack
	 * - Idempotent for same item (increments quantity)
	 */
	router.post(
		'/:id/pack',
		requireAuth,
		requirePermission(Action.UPDATE, Subject.CONTAINER),
		validateUuidParam,
		validateBody(ContainerSchema.pack),
		controller.packItem
	);

	/**
	 * @route POST /containers/:id/unpack
	 *
	 * Removes or reduces an item from a container.
	 *
	 * @remarks
	 * - Requires UPDATE permission on CONTAINER
	 * - Removes item entry if quantity reaches zero
	 */
	router.post(
		'/:id/unpack',
		requireAuth,
		requirePermission(Action.UPDATE, Subject.CONTAINER),
		validateUuidParam,
		validateBody(ContainerSchema.unpack),
		controller.unpackItem
	);

	/**
	 * @route POST /containers/move
	 *
	 * Moves an item between two containers.
	 *
	 * @remarks
	 * - Atomic operation (source → destination)
	 * - Validates request body using ContainerSchema.move
	 * - Does not require `:id` as it operates on two containers
	 */
	router.post(
		'/move',
		requireAuth,
		requirePermission(Action.UPDATE, Subject.CONTAINER),
		validateBody(ContainerSchema.move),
		controller.moveItem
	);

	return router;
};

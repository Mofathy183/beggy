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

// import express from 'express';
// import {
// 	VReqToUUID,
// 	VReqToCreateItem,
// 	VReqToModifyItem,
// 	VReqToCreateManyItems,
// } from '../../middlewares/validateRequest.js';
// import {
// 	headersMiddleware,
// 	VReqToHeaderToken,
// 	confirmDeleteMiddleware,
// 	VReqToConfirmDelete,
// 	checkPermissionMiddleware,
// } from '../../middlewares/authMiddleware.js';
// import {
// 	paginateMiddleware,
// 	searchMiddleware,
// 	orderByMiddleware,
// } from '../../middlewares/middlewares.js';
// import {
// 	getItemsBelongsToUser,
// 	getItemBelongsToUser,
// 	createItemForUser,
// 	createItemsForUser,
// 	replaceItemBelongsToUser,
// 	modifyItemBelongsToUser,
// 	deleteItemBelongsTo,
// 	deleteAllItemsBelongsToUser,
// } from '../controllers/itemsController.js';

// const itemsRoute = express.Router();

// //*======================================={Items ME Route}==============================================

// //* Validate request parameters
// itemsRoute.param('itemId', (req, res, next, itemId) =>
// 	VReqToUUID(req, res, next, itemId, 'itemId')
// );

// //* route to get items that user has by search IF THERE => GET user must by login
// //* GET / → Get all items for a user by Query OR ALL items
// //* Get items that belong to a specific user
// itemsRoute.get(
// 	'/',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkPermissionMiddleware('read:own', 'item'),
// 	paginateMiddleware,
// 	searchMiddleware,
// 	orderByMiddleware,
// 	getItemsBelongsToUser
// );

// //* route to get item that user has by user id => GET (params id) user must by login
// //* PUT /:itemId → Replace a user’s item
// //* Get items that belong to a specific user
// itemsRoute.get(
// 	'/:itemId',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkPermissionMiddleware('read:own', 'item'),
// 	getItemBelongsToUser
// );

// //* route for create item for User => POST (params id) user must by login
// //* POST "/:id" → Create an item for a user
// //* Create a single item for a user
// itemsRoute.post(
// 	'/',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkPermissionMiddleware('create:own', 'item'),
// 	VReqToCreateItem,
// 	createItemForUser
// );

// //* route for create items for User => POST (params id) user must by login
// //* POST "/multiple" → Create multiple items for a user
// //* Create multiple items for a user
// itemsRoute.post(
// 	'/multiple',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkPermissionMiddleware('create:own', 'item'),
// 	VReqToCreateManyItems,
// 	createItemsForUser
// );

// //* route for replace (update) item user has by id of the item => PUT param(id)
// //* PUT /:itemId → Replace a user’s item
// //* Replace an item that belongs to a user
// itemsRoute.put(
// 	'/:itemId',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkPermissionMiddleware('update:own', 'item'),
// 	VReqToCreateItem,
// 	replaceItemBelongsToUser
// );

// //* route for modify (update) item by id of the item => PATCH param(id)
// //* PATCH /:itemId → Modify a user’s item
// //* Modify an item that belongs to a user
// itemsRoute.patch(
// 	'/:itemId',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkPermissionMiddleware('update:own', 'item'),
// 	VReqToModifyItem,
// 	modifyItemBelongsToUser
// );

// //* route for delete all items that user has by user id => DELETE (params id) user must by login
// //* DELETE / → Delete all user’s items
// //* Delete all items that belong to a user
// itemsRoute.delete(
// 	'/',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkPermissionMiddleware('delete:own', 'item'),
// 	searchMiddleware,
// 	VReqToConfirmDelete,
// 	confirmDeleteMiddleware,
// 	deleteAllItemsBelongsToUser
// );

// //* route for delete item user has by id of the item => DELETE (params id) user must by login
// //* DELETE /:itemId → Delete a user’s item
// //* Delete a single item that belongs to a user
// itemsRoute.delete(
// 	'/:itemId',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkPermissionMiddleware('delete:own', 'item'),
// 	deleteItemBelongsTo
// );

// //*======================================={Items ME Route}==============================================

// //*======================================={Items Public Route}==============================================

// // //* route for get all items by Query or All Items => GET
// // //* GET "/items/search" → Get items by query
// // //* Get all items with optional search query
// // publicRoute.get(
// // 	'/items',
// // 	paginateMiddleware,
// // 	searchMiddleware, // Applies search filters if any
// // 	orderByMiddleware, // Applies sorting if any
// // 	getItemsByQuery
// // );

// // //* route for get item by id => GET (params id)
// // //* GET "items/:itemId" → Get a single item by ID
// // //* Get item by ID
// // publicRoute.get('/items/:itemId', getItemsById);

// //*======================================={Items Public Route}==============================================

// //*======================================={Items Private Route}==============================================

// // //* route for replace (update) item by id => PUT param(id)
// // //* PUT /items/:itemId → Replace an item (admin/member)
// // //* Replace (update) an item by ID
// // privateRoute.put(
// // 	'/items/:itemId',
// // 	VReqToHeaderToken,
// // 	headersMiddleware,
// // 	checkRoleMiddleware('admin', 'member'),
// // 	checkPermissionMiddleware('update:any', 'item'),
// // 	VReqToCreateItem,
// // 	replaceItemById
// // );

// // //* route for modify (update) item by id => PATCH param(id)
// // //* PATCH /items/:itemId → Modify an item (admin/member)
// // //* Modify (update) an item by ID
// // privateRoute.patch(
// // 	'/items/:itemId',
// // 	VReqToHeaderToken,
// // 	headersMiddleware,
// // 	checkRoleMiddleware('admin', 'member'),
// // 	checkPermissionMiddleware('update:any', 'item'),
// // 	VReqToModifyItem,
// // 	modifyItemById
// // );

// // //* route for delete All Items By Search or All => DELETE
// // //* DELETE /items → Delete all items (admin only)
// // //* Delete all items (Admin only)
// // privateRoute.delete(
// // 	'/items',
// // 	VReqToHeaderToken,
// // 	headersMiddleware,
// // 	searchMiddleware,
// // 	checkRoleMiddleware('admin'),
// // 	checkPermissionMiddleware('delete:any', 'item'),
// // 	VReqToConfirmDelete,
// // 	confirmDeleteMiddleware,
// // 	deleteAllItems
// // );

// // //* route for delete item by id => DELETE (params id)
// // //* DELETE /items/:itemId → Delete an item (admin/member)
// // //* Delete an item by ID
// // privateRoute.delete(
// // 	'/items/:itemId',
// // 	VReqToHeaderToken,
// // 	headersMiddleware,
// // 	checkRoleMiddleware('admin', 'member'),
// // 	checkPermissionMiddleware('delete:any', 'item'),
// // 	deleteItemById
// // );

// //*======================================={Items Private Route}==============================================

// export default itemsRoute;

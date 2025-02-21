import express from 'express';
import { VReqToUUID } from '../../middlewares/validateRequest.js';
import {
	headersMiddleware,
	checkRoleMiddleware,
	paginateMiddleware,
	VReqToHeaderToken,
} from '../../middlewares/authMiddleware.js';
import { getItemsBelongsToUser } from '../controllers/itemsController.js';

const itemsRoute = express.Router();

//* Validate request parameters
itemsRoute.param('id', VReqToUUID);

//todo: route for get all items => GET (query limit and pages)
itemsRoute.get(
	'/',
	VReqToHeaderToken,
	headersMiddleware, // check if header his token
	checkRoleMiddleware('admin', 'member'),
	paginateMiddleware
);

//todo: route for get item by id => GET (params id)
itemsRoute.get('/:id');

//todo: route to get items that user has by user id => GET (params id) user muet by login
itemsRoute.get(
	'/user/:id',
	VReqToHeaderToken,
	headersMiddleware, // check if header his token
	paginateMiddleware,
	getItemsBelongsToUser
);

//todo: route for create item for User => POST (params id) user muet by login
itemsRoute.post(
	'/user/:id',
	VReqToHeaderToken,
	headersMiddleware, // check if header his token
	checkRoleMiddleware('member')
	// VReqToCreateItem,
	// createItemForUser
);

export default itemsRoute;

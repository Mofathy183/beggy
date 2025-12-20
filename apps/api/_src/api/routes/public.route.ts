import express from 'express';
import { VReqToUUID } from '../../middlewares/validateRequest.js';
import {
	paginateMiddleware,
	searchMiddleware,
	searchForUsersMiddleware,
	orderByMiddleware,
} from '../../middlewares/middlewares.js';
import {
	getAllBagsByQuery,
	getBagById,
	getItemsByQuery,
	getItemsById,
	getAllSuitcasesByQuery,
	getSuitcaseById,
	getAllUsers,
	getUserPublicProfile,
} from '../controllers/publicController.js';

const publicRoute = express.Router();

//* Validate request parameters
publicRoute.param('id', (req, res, next, id) =>
	VReqToUUID(req, res, next, id, 'id')
);

publicRoute.param('bagId', (req, res, next, bagId) =>
	VReqToUUID(req, res, next, bagId, 'bagId')
);

publicRoute.param('itemId', (req, res, next, itemId) =>
	VReqToUUID(req, res, next, itemId, 'itemId')
);

publicRoute.param('suitcaseId', (req, res, next, suitcaseId) =>
	VReqToUUID(req, res, next, suitcaseId, 'suitcaseId')
);

//*======================================={Users Public Route}==============================================

//* route for search for users by query => GET
publicRoute.get(
	'/users',
	paginateMiddleware,
	orderByMiddleware,
	searchForUsersMiddleware,
	getAllUsers
);

//* route to get user public profile by id => GET param (id)
publicRoute.get('/users/:id', getUserPublicProfile);

//*======================================={Users Public Route}==============================================

//*======================================={Bags Public Route}==============================================

//* route for get all bags by Query Or ALL BAGS => GET (query limit and pages)
//* GET "/search" → Get bags by query If There OR ALL Bags
//* Get all bags with optional search query
publicRoute.get(
	'/bags',
	searchMiddleware,
	paginateMiddleware,
	orderByMiddleware,
	getAllBagsByQuery
);

//* route for get bag by id => GET (params id)
//* GET "/:bagId" → Get a single bag by ID
//* Get bag by ID
publicRoute.get('/bags/:bagId', getBagById);

//*======================================={Bags Public Route}==============================================

//*======================================={Items Public Route}==============================================

//* route for get all items by Query or All Items => GET
//* GET "/items/search" → Get items by query
//* Get all items with optional search query
publicRoute.get(
	'/items',
	paginateMiddleware,
	searchMiddleware, // Applies search filters if any
	orderByMiddleware, // Applies sorting if any
	getItemsByQuery
);

//* route for get item by id => GET (params id)
//* GET "items/:itemId" → Get a single item by ID
//* Get item by ID
publicRoute.get('/items/:itemId', getItemsById);

//*======================================={Items Public Route}==============================================

//*======================================={Suitcase Public Route}==============================================

//* route for get all suitcases by Query => GET (query limit and pages)
//* GET "/search" → Get suitcases by query
//* Get all suitcases with optional search query
publicRoute.get(
	'/suitcases',
	searchMiddleware,
	paginateMiddleware,
	orderByMiddleware,
	getAllSuitcasesByQuery
);

//* route for get suitcase by id => GET (params id)
//* GET "/:suitcaseId" → Get a single suitcase by ID
//* Get suitcase by ID
publicRoute.get('/suitcases/:suitcaseId', getSuitcaseById);

//*======================================={Suitcase Public Route}==============================================

export default publicRoute;

import express from "express";
import {
    autoFillItemFields,
    autoFillBagFields,
    autoFillSuitcaseFields
} from "../controllers/featuresController.js";
import {
    VReqToHeaderToken,
    headersMiddleware
} from "../../middlewares/authMiddleware.js";

const featureRoute = express.Router();

//todo: route for AI Auto-fill Item => POST (name, quantity, category)
featureRoute.post(
    "/ai/auto-fill/item",
    VReqToHeaderToken,
    headersMiddleware,
    autoFillItemFields
);

//todo: route for AI Auto-Fill Bag => 
featureRoute.post(
    "/ai/auto-fill/bag",
    VReqToHeaderToken,
    headersMiddleware,
    autoFillBagFields
);

//todo: route for AI Auto-Fill Suitcase => POST (name, type, size) optional (material, feature, brand, wheels)
featureRoute.post(
    "/ai/auto-fill/suitcase",
    VReqToHeaderToken,
    headersMiddleware,
    autoFillSuitcaseFields
);


export default featureRoute;
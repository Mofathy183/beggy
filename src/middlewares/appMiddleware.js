import cors from "cors";
import { coreConfig } from "../config/env.js";
import { statusCode } from "../config/statusCodes.js";
import { errorResponse } from "../config/responseMessages.js";


export const croeMiddleware = cors({
    origin: coreConfig.origin,
    method: "POST, GET, PUT, DELETE, OPTIONS, PATCH"
})

export const logger = (req, res, next) => {
    const tiemstamps = new Date().toISOString();
    console.log(`${tiemstamps}\n${req.method}\n${res.url}`);
    next();
};


export const errorMiddlewareHandler = (err, req, res, next) => {
    return res
        .status(err.status || statusCode.internalServerErrorCode)
        .json({
            status: err.status || statusCode.internalServerErrorCode,
            message: err.message || errorResponse.internalServerError,
        })
}


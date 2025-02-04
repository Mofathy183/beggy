import { JoiErrorHandler, errorHandler } from "./errorHandler.js";
import { statusCode } from "../config/statusCodes.js";

//* Handle Joi errors Response
export const JoiErrorResponse = (res, error) => {
    return res
    .status(statusCode.notFoundCode)
    .json(JoiErrorHandler(error))
}



export const errorResponse = (res, error, path, message) => {
    return res
    .status(statusCode.internalServerErrorCode)
    .json(errorHandler(error, path, message))
}


export const notFoundResponse = (res, error, path, message) => {
    return res
    .status(statusCode.notFoundCode)
    .json(errorHandler(error, path, message))
}
import { JoiErrorHandler, errorHandler, prismaErrorHandler } from "./errorHandler.js";
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


export const unAuthorizedResponse = (res, error, path, message) => {
    return res
    .status(statusCode.unauthorizedCode)
    .json(errorHandler(error, path, message))
}

export const forbiddenResponse = (res, error, path, message) => {
    return res
    .status(statusCode.forbiddenCode)
    .json(errorHandler(error, path, message))
}


export const conflictResponse = (res, error, path, message) => {
    return res
    .status(statusCode.conflictCode)
    .json(errorHandler(error, path, message))
}


//* Prisma error handling response
export const prismaErrorResponse = (res, error, path) => {
    const {name, code, status, message, target} = prismaErrorHandler(error, path);
    return res.status(status)
        .json({ prismaError: {
            success: false,
            status,
            name,
            code,
            message,
            target,
            path
        }
    });
}
import { statusCode } from "../config/statusCodes.js";

//* @param error {error object} 
//* @param path {array} [folder, function, the part it come from] 
//* @param message {string} optional message or message in error object
//* @return {
//* message,
//* error,
//* path,
//*}  
export const errorHandler = (error, path, message="error") => {
    return {
        message: message || error.message,
        error,
        path,
    }
}


//* handle error comes from Joi
export const JoiErrorHandler = (error) => {
    return { JoiError : error.details[0] };
}



const prismaErrorTemplate = (name, code, message, target, status, path) => {
    return {
        status,
        message,
        name,
        code,
        target,
        path
    }
}

//* handle Prisma errors 
export const prismaErrorHandler = (error, path) => {
    const { name, code, meta } = error;

    if (name === 'PrismaClientKnownRequestError') {
        switch (code) {
            case 'P2002':
                return prismaErrorTemplate(
                    name, 
                    code, 
                    'Unique constraint violation',
                    meta.target, 
                    statusCode.badRequestCode,
                    path, 
                )
            case 'P2003':
                return prismaErrorTemplate(
                    name, 
                    code, 
                    "Foreign key constraint violation", 
                    meta.target, 
                    statusCode.unprocessableEntityCode,
                    path, 
                )
            case 'P2013':
                return prismaErrorTemplate(
                    name, 
                    code, 
                    "Missing required argument for field ", 
                    meta.target,
                    statusCode.badRequestCode,
                    path, 
                )
            case 'P2025':
                return prismaErrorTemplate(
                    name, 
                    code, 
                    "Record not found", 
                    meta.target,
                    statusCode.notFoundCode,
                    path, 
                )
            default:
                return prismaErrorTemplate(
                    name, 
                    code, 
                    "Database error", 
                    meta.target, 
                    statusCode.internalServerErrorCode,
                    path, 
                )
            }
        }

    return prismaErrorTemplate(
        name, 
        code, 
        "Database error", 
        meta.target, 
        statusCode.internalServerErrorCode,
        path, 
    )
}
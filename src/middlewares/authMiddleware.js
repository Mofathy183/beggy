import { verifyToken } from "../utils/jwt.js";
import { UserModel } from "../../prisma/prisma.js";
import { passwordChangeAfter } from "../utils/helper.js";
import { unAuthorizedResponse, prismaErrorResponse } from "../utils/errorResponse.js";

export const headersMiddleware = async (req, res, next) => {
    if (!req.headers.authorization && !req.headers.authorization.startsWith("Bearer ")) {
        return unAuthorizedResponse(
            res, 
            "Token Not Provided", 
            ["middlewares","headersMiddleware", "request headers"]
        );
    } 

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return unAuthorizedResponse(
            res, 
            "Token Not Provided", 
            ["middlewares","headersMiddleware", "Token not provided"]
        )
    }

    const isAuthenticated = verifyToken(token);

    if(!isAuthenticated) {
        return unAuthorizedResponse(
            res, 
            "Token invalid", 
            ["middlewares","headersMiddleware", "Token invalid"]
        )
    }


    //? check if the id in the token is the same as the user has
    const userAuth = await UserModel.findUnique({ where: { id: isAuthenticated.id }});

    if (userAuth.error) {
        return prismaErrorResponse(
            res, 
            userAuth.error, 
            ["middlewares","headersMiddleware", "invalid token id"]
        ) 
    }


    //? check if the user changed their password after login
    const passwordHasChanged = passwordChangeAfter(userAuth, isAuthenticated.iat);

    //? if the user has changed their password, return an error message and unauthorized status code
    if(passwordHasChanged) {
        return unAuthorizedResponse(
            res, 
            "User has changed their password", 
            ["middlewares", "headersMiddleware", "password has changed"]
        );
    }


    req.user = userAuth;
    next();
}


//* check if the user has the required role to do that action
export const checkRoleMiddleware = (...roles) => {
    return (req, res, next) => {
        try {
            const { user } = req;
            const hasRole = roles.some(role => user.role === role);
    
            if (!hasRole) {
                return unAuthorizedResponse(
                    res, 
                    "User does not have the required role", 
                    ["middlewares", "checkRoleMiddleware", "no required role"]
                );
            }
            
            next();
        }
    
        catch (error) {
            return prismaErrorResponse(
                res, 
                error, 
                ["middlewares", "checkRoleMiddleware", "check role error"]
            );
        }
    }
}




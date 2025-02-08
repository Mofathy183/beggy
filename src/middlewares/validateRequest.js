import { userSchema } from "../api/validators/userValidator.js";
import { uuidValidator } from "../api/validators/userValidator.js";
import { loginSchema, singUpSchema } from "../api/validators/authValidator.js";
import { JoiErrorHandler } from  "../utils/errorHandler.js";
import { statusCode } from "../config/statusCodes.js";


// //? if the user not add the required fields in the body request
// //! will prevent the request from being processed or continue
const VReqTo = (req, res, next, schema) => {
    const { body } = req;
    const { error } = schema.validate(body);

    // // //* first convert the value to boolean the last ! is not
    //? check if there an error 
    //* if there is not an error will continue the request
    if(!error) return next();

    //* if there is an error will send bad request with the error message
    return res.status(statusCode.badRequestCode).json({
        status: statusCode.badRequestCode,
        success: false,
        JoiError: JoiErrorHandler(error)
    })
}

//* check for the request body in creating new user (ValidateRequest === VReq)
export const VReqToCreateUser = (req, res, next) => {
    return VReqTo(req, res, next, userSchema)
};


//* check for the request body in Sing-up (ValidateRequest === VReq)
export const VReqToSingUp = (req, res, next) => {
    return VReqTo(req, res, next, singUpSchema)
}


//* check for the request body in Login (ValidateRequest === VReq)
export const VReqToLogin = (req, res, next) => {
    return VReqTo(req, res, next, loginSchema)
}



//? if the id is not present or not valid
//! will prevent the request from being processed or continue 
export const VReqToUUID = (req, res, next) => {
    const { id } = req.params;
    const isValid = uuidValidator(id);

    if(isValid) return next();

    return res.status(statusCode.badRequestCode).json({
        success: false,
        message: 'Invalid UUID',
        path: ["middlewares", "validateRequest", "VReqToUUID"]
    })
}


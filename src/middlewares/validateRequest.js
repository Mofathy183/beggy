import { userSchema, singUpSchema, loginSchema } from "../api/validators/userValidator.js";
import { uuidValidator } from "../api/validators/userValidator.js";

//? if the user not add the required fields in the body request
//! will prevent the request from being processed or continue

const VReqTo = (req, res, next, schema) => {
    const { body } = req;
    const { error } = schema.validate(body);

    //* first !! to convert the value to boolean the last ! is not
    if(!!!error) return next();

    return res.json({
        success: false,
        message: error.details[0].message,
        errors: error.details.length.map(err => {err.message})
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

    return res.json({
        success: false,
        message: 'Invalid UUID'
    })
}


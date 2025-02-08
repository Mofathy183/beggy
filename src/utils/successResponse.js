import { statusCode } from "../config/statusCodes.js";


//* for how it will display the the user if find user or users or create a new user
const successfullyForUser = (data, message, status) => {
    return {
        success: true,
        status: status,
        message: message,
        data : data 
    }
};


export const successCreatUser = (res, newUser) => {
    return res
    .status(statusCode.createdCode)
    .json(successfullyForUser(newUser, "User created successfully", statusCode.createdCode));
}



export const successFind = (res, user) => {
    let message = Array.isArray(user) ? "Users found successfully" : "Find User Successfully";
    return res
    .status(statusCode.okCode)
    .json(successfullyForUser(user, message, statusCode.okCode));
}



export const successUpdate = (res, update) => {
    const message = Array.isArray(update) ? "Users updated successfully" : "Update User Successfully";
    return res
    .status(statusCode.okCode)
    .json(successfullyForUser(update, message, statusCode.okCode));
}


export const successDelete = (res, deleted) => {
    const message = Array.isArray(deleted) ? "All Users deleted successfully" : "delete User Successfully";
    return res
    .status(statusCode.okCode)
    .json(successfullyForUser(deleted, message, statusCode.okCode));
}



//*=============================================================================\\

const successfulForAuth = (data, message, statusCode, token) => {
    return {
        success: true,
        status: statusCode,
        message: message,
        token: token,
        data : data
    }
}



export const successSingUp = (res, user, token) => {
    return res
    .status(statusCode.okCode)
    .json(successfulForAuth(user, "User signed up successfully", statusCode.okCode, token));
}




export const successLogin = (res, user, token) => {
    return res
    .status(statusCode.okCode)
    .json(successfulForAuth(user, "User Login successfully", statusCode.okCode, token));
}
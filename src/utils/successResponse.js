import { statusCode } from "../config/statusCodes.js";


//* for how it will display the the user if find user or users or create a new user
const successfully = (data, message, status) => {
    return {
        success: true,
        status: status,
        message: message,
        data : data 
    }
};


export const successCreatUser = (res, newUser) => {
    return res
    .status(statusCode.okCode)
    .json(successfully(newUser, "User created successfully", statusCode.okCode));
}



export const successFind = (res, user) => {
    let message = Array.isArray(user) ? "Users found successfully" : "Find User Successfully";
    return res
    .status(statusCode.okCode)
    .json(successfully(user, message, statusCode.okCode));
}



export const successUpdate = (res, update) => {
    const message = Array.isArray(update) ? "Users updated successfully" : "Update User Successfully";
    return res
    .status(statusCode.okCode)
    .json(successfully(update, message, statusCode.okCode));
}


export const successDelete = (res, deleted) => {
    const message = Array.isArray(deleted) ? "All Users deleted successfully" : "delete User Successfully";
    return res
    .status(statusCode.okCode)
    .json(successfully(deleted, message, statusCode.okCode));
}
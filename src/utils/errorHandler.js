

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
import Joi from "joi";
import validator from 'validator';

const passwordRegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!?%*&]{8,}$/;

//*######################################{JOI Check Feildes}############################################

//* Check the Feildes for createing a new User for user model
export const userSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    
    email: Joi.string()
    .email({tlds: {allow: false}})
    .message("Invalid email Format")
    .required(),
    
    password: Joi.string()
    .min(8)
    .pattern(new RegExp(passwordRegExp))
    .message("Password Must Be Between 8 and 20 Characters Long And Include At Least One Uppercase Letter, One Lowercase Letter, One Digit, And One Special Character From Them [@$!%*?&]")
    .required(),
    
    confirmPassword: Joi.ref('password'),
    
    birth: Joi.date(),    
    
    country: Joi.string(),
    
    gender: Joi.string()
    .valid('male', 'female'),
    
    profilePicture: Joi.string(),
})

//*######################################{JOI Check Feildes}############################################




//*######################################{User Validators}############################################

// export const passwordValidator = (password) => {
//     return validator.isStrongPassword(password)
// }


// export const emailValidator = (email) => {
//     return validator.isEmail(email)
// }

// export const usernameValidator = (username) => {
//     return validator.isAlphanumeric(username) && validator.isLength(username, { min: 6, max: 20 })
// }

export const uuidValidator = (uuid) => {
    return validator.isUUID(uuid)
}


export const isUUIDExist = (uuid) => !!uuid



// export const isEmailExist = (email) => !!email


// // export const isUsernameExist = (username) =>!!username   
// export const isPasswordExist = (password) => !!password

//*######################################{User Validators}############################################



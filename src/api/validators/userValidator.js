import Joi from "joi";
import validator from 'validator';

const passwordRegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!?%*&]{8,}$/;

const usernameRegExp = /^[a-zA-Z0-9_]{6,20}$/

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
    
    birth: Joi.date()
    .required(),    
    
    country: Joi.string()
    .required(),
    
    gender: Joi.string()
    .valid('male', 'female')
    .required(),
    
    profilePicture: Joi.string(),
})



//* Check the Feildes Of Sing-up form
export const singUpSchema = Joi.object({
    username: Joi.string().required().pattern(new RegExp(usernameRegExp)).required(),
    
    email: Joi.string().email({tlds: {allow: false}}).message("Invalid email Format").required(),
    
    password: Joi.string()
    .min(8)
    .pattern(new RegExp(passwordRegExp))
    .message("Password Must Be Between 8 and 20 Characters Long And Include At Least One Uppercase Letter, One Lowercase Letter, One Digit, And One Special Character From Them [@$!%*?&]")
    .required(),
    
    confirmPassword: Joi.ref('password'),
});



//* Check the Feildes Of login form
export const loginSchema = Joi.object({
    email: Joi.string().email({tlds: {allow: false}}).message("Invalid email Format").required(),
    
    password: Joi.string()
    .min(8)
    .pattern(new RegExp(passwordRegExp))
    .message("Password Must Be Between 8 and 20 Characters Long And Include At Least One Uppercase Letter, One Lowercase Letter, One Digit, And One Special Character From Them [@$!%*?&]")
    .required(),
});

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



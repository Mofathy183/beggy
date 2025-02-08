import Joi from "joi";
// const usernameRegExp = /^[a-zA-Z0-9_]{6,20}$/

const passwordRegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!?%*&]{8,}$/;

//* Check the Feildes Of Sing-up form
export const singUpSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),

    email: Joi.string().email({tlds: {allow: false}}).message("Invalid email Format").required(),
    
    password: Joi.string()
    .min(8)
    .pattern(new RegExp(passwordRegExp))
    .message("Password Must Be Between 8 and 20 Characters Long And Include At Least One Uppercase Letter, One Lowercase Letter, One Digit, And One Special Character From Them [@$!%*?&]")
    .required(),
    
    confirmPassword: Joi.ref('password'),

    // birth: Joi.date(),    
    
    // country: Joi.string(),
    
    // gender: Joi.string()
    // .valid('male', 'female'),
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
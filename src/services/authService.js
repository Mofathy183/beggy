import { singToken } from "../utils/jwt.js";
import { errorHandler, JoiErrorHandler, prismaErrorHandler } from "../utils/errorHandler.js";
import { hashingPassword, verifyPassword } from "../utils/hash.js";
import { UserModel } from "../../prisma/prisma.js";
import { passwordChangeAfter } from "../utils/helper.js";
import crypto from "crypto";



export const singUpUser = async (body) => {
    try {
        const {
            firstName,
            lastName,
            username,
            email,
            password,
            confirmPassword,
        } = body;


        // Check if email is unique
        const isEmailUnique = await UserModel.findUnique({ where: { email } });
        
        if (isEmailUnique.error) return prismaErrorHandler(
            isEmailUnique.error, 
            ["services", "singUpUser", "prisma error from find unique by email"]
        )

        // Hashing the password
        if (password !== confirmPassword) return errorHandler(
            "Plaese enter the same Password", 
            ["services", "singUpUser", "password"]
        )

        const hashPassword = await hashingPassword(password);

        // Create new user in Prisma
        const newUser = await UserModel.create({
            data: {
                firstName,
                lastName,
                username,
                email,
                password: hashPassword,
            },
            omit:{
                password: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (newUser.error) prismaErrorHandler(
            newUser.error, 
            ["services", "singUpUser", "prisma error from create user"]
        )

        // sing token when successful sing up User 
        const token = singToken(newUser.id);

        return {newUser: newUser, token: token};
    } 
    
    catch (error) {
        return errorHandler(
            error, 
            ["services", "singUpUser", "catch"],
            "Failed to add user"
        )
    }
};




export const loginUser = async (body) => {
    try{
        const { email, password } = body;

        // Check if user exists
        const user = await UserModel.findUnique({ where: { email } });
        
        if (user.error) return prismaErrorHandler(
            user.error, 
            ["services", "loginUser", "prisma error from find unique by email"]
        )

        // Check if password matches
        const isPasswordMatch = await verifyPassword(password, user.password);
        
        if (!isPasswordMatch) return errorHandler(
            "Incorrect Password", 
            ["services", "loginUser", "incorrect password"]
        )

        // sing token when successful login User
        const token = singToken(user.id);

        return {user: user, token: token};
    }

    catch (error) {
        return errorHandler(error, ["services", "loginUser", "catch"], "Failed to login user")
    }
}



export const forgotUserPassword = async (email) => {
    try {
        if (!email) {
            return errorHandler("Email is required", ["services", "forgotUserPassword", "email"])
        }

        const user = await UserModel.findUnique({where: {email: email}});

        if (user.error) return prismaErrorHandler(
            user.error, 
            ["services", "forgotUserPassword", "prisma error from find unique by email"]
        )
        

        // Generate a random password by crypto
        const randomPassword = crypto.randomBytes(32).toString("hex");
    }

    catch (error) {
        return errorHandler(
            error, 
            ["services", "forgotUserPassword", "catch"], 
            ""
        )
    }
}






// Handle the data that comes from facebook
export const FacebookUserProvider = async (facebookProfile) => {
    try {
        return console.log(facebookProfile);
    }

    catch (error) {
        return errorHandler(
            error, 
            ["services", "FacebookUserProvider", "catch"], 
            "Failed to authenticate user with Facebook"
        )
    }
}






const body ={
    // "firstName": "Jafe",
    // "lastName": "Ron",
    // "username": "JaffRone14",
    "email": "jaferr0n12@gmail.com",
    "password": "P@ssw0rd123",
    // "confirmPassword": "P@ssw0rd123",
    // "gender": "male",
    // "birth": "1998-02-08",
    // "country": "UK"
}

async function create(){
    try {
        const newUser = await loginUser(body);
        console.log(newUser);
    } catch (error) {
        console.log("Failed to add user");
        console.error(error.message);
    }
}


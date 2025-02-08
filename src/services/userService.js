import { userSchema, uuidValidator } from "../api/validators/userValidator.js";
import { UserModel } from "../../prisma/prisma.js";
import { birthOfDate, picture, passwordChangeAt } from "../utils/helper.js";
import { hashingPassword } from "../utils/hash.js";
import { errorHandler, JoiErrorHandler, prismaErrorHandler } from "../utils/errorHandler.js";

export const addUser = async (body) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            gender,
            birth,
            country,
        } = body;

        // check if there profile picture or undefined
        const profilePicture = picture(body);


        // make it date format to add to database 
        const birthDate = birthOfDate(birth);


        // Hashing the password
        const hashPassword = await hashingPassword(password);

        // Create new user in Prisma
        const newUser = await UserModel.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashPassword,
                gender,
                birth: birthDate,
                country,
                profilePicture,
            },
            omit:{
                password: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (newUser.error) return prismaErrorHandler(
            newUser.error, 
            ["services", "addUser", "prisma error form create user"]
        );

        return newUser;
    } 
    
    catch (error) {
        return errorHandler(
            error, 
            ["services", "addUser", "catch"], 
            "Failed to add user"
        );
    }
};


export const getUserById = async (id) => {
    try {
        const user = await UserModel.findUnique({
            where: { id: id },
            include: {
                suitcases: true,
                bags: true,
                items: true,
            },
            omit: {
                password: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        if (user.error) return prismaErrorHandler(
            user.error, 
            ["services", "getUserById", "prisma error from find unique by user id"]
        );

        if (!user) return errorHandler(
            "User not found", 
            ["services", "getUserById", "user"]
        );

        return user;
    }

    catch (error) {
        return errorHandler(
            error, 
            ["services", "getUserById", "catch"], 
            "Failed to get user by id"
        )
    }
}



export const getAllUsers = async () => {
    try {
        const users = await UserModel.findMany({
            include: {
                suitcases: true,
                bags: true,
                items: true,
            },
            omit: {
                password: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        if (users.error) return prismaErrorHandler(
            users.error, 
            ["services", "getAllUsers", "prisma error from find all users"]
        );

        if (!users) return errorHandler(
            "No users found", 
            ["services", "getAllUsers", "users"]
        );

        return users;
    }

    catch (error) {
        return errorHandler(
            error, 
            ["services", "getAllUsers", "catch"], 
            "Failed to get all users"
        );
    }
}


//* for PUT requests
export const replaceResource = async (id, body) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            gender,
            birth,
            country,
        } = body;

        const hashedPassword = await hashingPassword(password);

        
        const updatedUser = await UserModel.update({
            where: { id: id },
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                passwordChangeAt: passwordChangeAt(),
                gender,
                profilePicture: picture(body),
                birth: birthOfDate(birth),
                country,
            },
            include: {
                suitcases: true,
                bags: true,
                items: true,
            },
            omit: {
                password: true,
                createdAt: true,
                updatedAt: true,
            }
        })

        if (updatedUser.error) return prismaErrorHandler(
            updatedUser.error, 
            ["services", "replaceResource", "prisma error from update all user data"]
        );

        
        if (!updatedUser) return errorHandler("User not found", ["services", "replaceResource", "user"]);
        
        return updatedUser;
    }
    
    catch (error) {
        return errorHandler(error, ["services", "replaceResource", "catch"], "Failed to update user by id")
    }
}



//* for PATCH requests
export const modifyResource = async (id, body) => {
    try {
        const {
            firstName,
            lastName,
            email,
            gender,
            birth,
            country,
            confirmPassword
        } = body;

        if (body.password) {
            if (body.password !== confirmPassword) 
                return errorHandler(
                "Plaess enter the same Password", 
                ["services", "modifyResource", "password"]
            );

            const hashedPassword = await hashingPassword(password);
            body.password = hashedPassword;
        }


        const updatedUser = await UserModel.update({
            where: { id: id },
            data: {
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                email: email || undefined,
                password: body.password || undefined,
                gender: gender || undefined,
                profilePicture: picture(body),
                passwordResetAt: password ? passwordChangeAt() : undefined, 
                birth: birthOfDate(birth),
                country: country || undefined,
            },
            omit: {
                password: true,
                createdAt: true,
                updatedAt: true,
            }
        })

        if (updatedUser.error) return prismaErrorHandler(
            updatedUser.error, 
            ["services", "modifyResource", "prisma error from modify user data"]
        );

        if (!updatedUser) return errorHandler(
            "User not found", 
            ["services", "modifyResource", "user"]
        );

        return updatedUser;
    }

    catch (error) {
        return errorHandler(
            error, 
            ["services", "modifyResource", "catch"], 
            "Failed to modify resource by id"
        );
    }
}



export const removeUser = async (id) => {
    try {
        const deleteUser = await UserModel.delete({ where: { id: id } });

        if (deleteUser.error) return prismaErrorHandler(
            deleteUser.error, 
            ["services", "removeUser", "prisma error from delete user by id"]
        );

        if (!deleteUser) return errorHandler(
            "User not found", 
            ["services", "removeUser", "user"]
        );

        return deleteUser;
    }

    catch (error) {
        return errorHandler(
            error, 
            ["services", "removeUser", "catch"], "Failed to remove user by id"
        );
    }
}




export const removeAllUsers = async () => {
    try {
        const removeAll = await UserModel.deleteMany({ where: {} });
        
        if (removeAll.error) return prismaErrorHandler(
            removeAll.error, 
            ["services", "removeAllUsers", "prisma error from delete all users"]
        );

        if (!removeAll) return errorHandler(
            "No users found", 
            ["services", "removeAllUsers", "users"]
        );

        return removeAll;
    }

    catch (error) {
        return errorHandler(
            error, 
            ["services", "removeAllUsers", "catch"], 
            "Failed to remove all users"
        );
    }
}

// Test the function
const body = {
    "firstName": "John",
    "lastName": "Don",
    "email": "johnd0nw00@example.com",
    "password": "P@ssw0rd123",
    "confirmPassword": "P@ssw0rd123",
    "gender": "male",
    "birth": "2002-10-15",
    "country": "France"
};

// (async () => {
//     try {
//         const newUser = await replaceResource("4af12b76-4460-4be9-9fe5-d43cb3e72e95", body);
//         console.log(newUser);
//     } catch (error) {
//         console.log("Failed to add user");
//         console.error(error.message);
//     }
// })();

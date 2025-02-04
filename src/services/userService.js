import { userSchema, uuidValidator } from "../api/validators/userValidator.js";
import { UserModel } from "../../prisma/prisma.js";
import { birthOfDate, picture } from "../utils/helper.js";
import { hashingPassword } from "../utils/hash.js";
import { errorHandler, JoiErrorHandler } from "../utils/errorHandler.js";

export const addUser = async (body) => {
    try {
        const { error } = userSchema.validate(body);

        if (error) {
            return JoiErrorHandler(error);
        }

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
                username:true,
                password: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return newUser;
    } 
    
    catch (error) {
        return errorHandler(error, ["services", "addUser", "catch"], "Failed to add user")
    }
};


export const getUserById = async (id) => {
    try {
        if (!uuidValidator(id)) 
            return errorHandler("UUID is not valid", ["services", "getUserById", "uuidValidator"]);


        const user = await UserModel.findUnique({
            where: { id: id },
            include: {
                suitcases: true,
                bags: true,
                items: true,
            },
            omit: {
                username: true,
                password: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        if (!user) return errorHandler("User not found", ["services", "getUserById", "user"]);

        return user;
    }

    catch (error) {
        return errorHandler(error, ["services", "getUserById", "catch"], "Failed to get user by id")
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
                username: true,
                password: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        if (!users) return errorHandler("No users found", ["services", "getAllUsers", "users"]);

        return users;
    }

    catch (error) {
        return errorHandler(error, ["services", "getAllUsers", "catch"], "Failed to get all users")
    }
}


//* for PUT requests
export const replaceResource = async (id, body) => {
    try {
        const { error } = userSchema.validate(body);

        if (error) {
            return JoiErrorHandler(error);
        }

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
                username: true,
                password: true,
                createdAt: true,
                updatedAt: true,
            }
        })

        
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
        if (!uuidValidator(id)) 
            return errorHandler("UUID is not valid", ["services", "getUserById", "uuidValidator"]);

        const {
            firstName,
            lastName,
            email,
            gender,
            birth,
            country,
            confirmPassword
        } = body;

        let {            
            password,
        } = body;

        if (password) {
            if (password !== confirmPassword) 
                return errorHandler("Plaess enter the same Password", ["services", "modifyResource", "password"]);

            const hashedPassword = await hashingPassword(password);
            password = hashedPassword;
        }


        const updatedUser = await UserModel.update({
            where: { id: id },
            data: {
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                email: email || undefined,
                password: password || undefined,
                gender: gender || undefined,
                profilePicture: picture(body),
                birth: birthOfDate(birth),
                country: country || undefined,
            },
            omit: {
                username: true,
                password: true,
                createdAt: true,
                updatedAt: true,
            }
        })

        if (!updatedUser) return errorHandler("User not found", ["services", "modifyResource", "user"]);

        return updatedUser;
    }

    catch (error) {
        return errorHandler(error, ["services", "modifyResource", "catch"], "Failed to modify resource by id")
    }
}



export const removeUser = async (id) => {
    try {
        if (!uuidValidator(id)) 
            return errorHandler("UUID is not valid", ["services", "removeUser", "uuidValidator"]);

        const deleteUser = await UserModel.delete({ where: { id: id } });

        if (!deleteUser) return errorHandler("User not found", ["services", "removeUser", "user"]);

        return deleteUser;
    }

    catch (error) {
        return errorHandler(error, ["services", "removeUser", "catch"], "Failed to remove user by id")
    }
}




export const removeAllUsers = async () => {
    try {
        const removeAll = await UserModel.deleteMany({ where: {} });
        
        if (!removeAll) return errorHandler("No users found", ["services", "removeAllUsers", "users"]);

        return removeAll;
    }

    catch (error) {
        return errorHandler(error, ["services", "removeAllUsers", "catch"], "Failed to remove all users")
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

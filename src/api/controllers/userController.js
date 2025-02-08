import { 
    addUser, 
    getUserById, 
    getAllUsers, 
    replaceResource, 
    modifyResource,
    removeUser,
    removeAllUsers
} from "../../services/userService.js";
import { errorResponse, notFoundResponse, prismaErrorResponse } from "../../utils/errorResponse.js";
import { 
    successCreatUser, 
    successFind, 
    successUpdate,
    successDelete
} from "../../utils/successResponse.js";


export const createUser = async (req, res) => {
    try {
        const { body } = req;
        
        const newUser = await addUser(body);

        if(newUser.error) return prismaErrorResponse(
            res, 
            newUser.error, 
            ["controllers", "createUser", "prisma error from new User error"]
        );

        return successCreatUser(
            res, 
            newUser, 
        );
    }

    catch (error) {
        return errorResponse(
            res, 
            error, 
            ["controllers", "createUser", "catch"], 
            "Failed to create user"
        );
    }
}


export const findUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await getUserById(id);

        if (user.error) return prismaErrorResponse(
            res, 
            user.error, 
            ["controllers", "findUserById", "prisma error from find user by id"]
        );

        if (!user) return notFoundResponse(
            res, 
            "User not found", 
            ["services", "getUserById", "user"]
        );

        return successFind(res, user);
    }

    catch (error) {
        return errorResponse(
            res, 
            error, 
            ["controllers", "findUserById", "catch"], 
            "Failed to find user by id"
        );
    }
}



export const findAllUsers = async (req, res) => {
    try {
        const users = await getAllUsers();

        if (users.error) return prismaErrorResponse(
            res, 
            users.error, 
            ["controllers", "findAllUsers", "prisma error from find all users"]
        );

        if (!users) return notFoundResponse(
            res, 
            "User not found",
            ["services", "findAllUsers", "no users found"]
        );
        
        return successFind(res, users);
    }

    catch (error) {
        return errorResponse(
            res, 
            error, 
            ["controllers", "findAllUsers", "catch"], 
            "Failed to find all users"
        );
    }
}



//* for PUT requests
export const updateUserById = async (req, res) => {
    try{
        const { id } = req.params;

        const { body } = req;

        const userUpdated = await replaceResource(id, body);

        if (userUpdated.error) return prismaErrorResponse(
            res, 
            userUpdated.error, 
            ["controllers", "updateUserById", "prisma error from replace user data by id"]
        );

        if (!userUpdated) return notFoundResponse(
            res, 
            "User Not Found to Update", 
            ["controllers", "updateUserById", "try check userUpdate exsists"]
        );

        return successUpdate(res, userUpdated);
    }

    catch (error) {
        return errorResponse(
            res, 
            error, 
            ["controllers", "updateUserById", "catch"], 
            "Failed to update user by id"
        );
    }
}



//* for PATCH requests
export const modifyUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const { body } = req;

        const updatedUser = await modifyResource(id, body);

        if (updatedUser.error) return prismaErrorResponse(
            res, 
            updatedUser.error, 
            ["controllers", "modifyUserById", "prisma error from modify user data by id"]
        );

        return successUpdate(res, updatedUser);
    }

    catch (error) {
        return errorResponse(
            res, 
            error, 
            ["controllers", "modifyUserById", "catch"], 
            "Failed to modify user by id"
        );
    }
}



export const deleteUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const userDeleted = await removeUser(id);

        if (userDeleted.error) return prismaErrorResponse(
            res, 
            userDeleted.error, 
            ["controllers", "deleteUserById", "prisma error from remove user by id"]
        );

        if (!userDeleted) return notFoundResponse(
            res, 
            "User Not Found to Delete", 
            ["controllers", "deleteUserById", "try check userDelete exsists"]
        );

        return successDelete(res, userDeleted);
    }

    catch (error) {
        return errorResponse(
            res, 
            error, 
            ["controllers", "deleteUserById", "catch"], 
            "Failed to delete user by id"
        );
    }
}




export const deleteAllUsers = async (req, res) => {
    try {
        const usersDeleted = await removeAllUsers();

        if (usersDeleted.error) return prismaErrorResponse(
            res, 
            usersDeleted.error, 
            ["controllers", "deleteAllUsers", "prisma error from remove all users"]
        );

        return successDelete(res, usersDeleted);
    }

    catch (error) {
        return errorResponse(
            res, 
            error, 
            ["controllers", "deleteAllUsers", "catch"], 
            "Failed to delete all users"
        );
    }
}
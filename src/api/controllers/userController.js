import { addUser, getUserById, getAllUsers, replaceResource, modifyResource } from "../../services/userService.js";
import { userSchema, uuidValidator } from "../validators/userValidator.js";
import { JoiErrorResponse, errorResponse, notFoundResponse } from "../../utils/errorResponse.js";
import { successCreatUser, successFind, successUpdate } from "../../utils/successResponse.js";


export const createUser = async (req, res) => {
    try {
        const { body } = req;

        const { error } = userSchema.validate(body)

        if ( error ) return JoiErrorResponse(res, error);
        
        const newUser = await addUser(body);

        return successCreatUser(res, newUser, "User created successfully");
    }

    catch (error) {
        return errorResponse(res, error, ["controllers", "createUser", "catch"], "Failed to create user");
    }
}


export const findUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if(!uuidValidator(id))
            return notFoundResponse(res, "UUID is not valid", ["controllers", "findUserById", "uuidValidator"]);

        const user = await getUserById(id);

        if (!user) return notFoundResponse(res, "User not found", ["services", "getUserById", "user"]);

        return successFind(res, user);
    }

    catch (error) {
        return errorResponse(res, error, ["controllers", "findUserById", "catch"], "Failed to find user by id");
    }
}



export const findAllUsers = async (req, res) => {
    try {
        const users = await getAllUsers();

        if (!users) return notFoundResponse(res, "User not found", ["services", "findAllUsers", "no users found"]);
        
        return successFind(res, users);
    }

    catch (error) {
        return errorResponse(res, error, ["controllers", "findAllUsers", "catch"], "Failed to find all users");
    }
}



//* for PUT requests
export const updateUserById = async (req, res) => {
    try {
        const { id } = req.params;
        if(!uuidValidator(id))
            return notFoundResponse(res, "UUID is not valid", ["controllers", "updateUserById", "uuidValidator"]);
        
        const { body } = req;
        
        const updatedUser = await replaceResource(id, body);
        
        if (!updatedUser) return notFoundResponse(res, "User not found", ["services", "updateUserById", "user updated"]);

        return successUpdate(res, updatedUser);
    }

    catch (error) {
        return errorResponse(res, error, ["controllers", "updateUserById", "catch"], "Failed to update user by id");
    }
}



//* for PATCH requests
export const modifyUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if(!uuidValidator(id))
            return notFoundResponse(res, "UUID is not valid", ["controllers", "modifyUserById", "uuidValidator"]);

        const { body } = req;

        const updatedUser = await modifyResource(id, body);

        return successUpdate(res, updatedUser);
    }

    catch (error) {
        return errorResponse(res, error, ["controllers", "modifyUserById", "catch"], "Failed to modify user by id");
    }
}
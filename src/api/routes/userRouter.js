import express from "express";
import { 
    createUser, 
    findUserById, 
    findAllUsers, 
    updateUserById, 
    modifyUserById,
    deleteUserById,
    deleteAllUsers
} from "../controllers/userController.js";
import { VReqToUUID, VReqToCreateUser } from "../../middlewares/validateRequest.js"
import { headersMiddleware, checkRoleMiddleware } from "../../middlewares/authMiddleware.js";

const userRoute = express.Router();


//* to check if the id in params is valid and exists
userRoute.param("id", VReqToUUID)

//todo: route for creating user => POST  //create-user
userRoute.post("/", VReqToCreateUser, createUser);


//todo: route for find user by id => GET param(id)  //get-user
userRoute.get("/:id", findUserById);


//todo: route for find all user => GET //get-users
userRoute.get("/", findAllUsers);


//todo: route for update user by id => PUT param(id)  //update
userRoute.put("/:id", VReqToCreateUser, updateUserById);


//todo: route for update user by id => PATCH param(id) //update
userRoute.patch("/:id", modifyUserById);


//todo: route for delete user by id => DELETE param(id) //delete
userRoute.delete("/:id", headersMiddleware, checkRoleMiddleware("admin", "member"), deleteUserById);



//todo: route for delete all users => DELETE  //delete
userRoute.delete("/", headersMiddleware, checkRoleMiddleware("admin", "member"), deleteAllUsers)



export default userRoute;
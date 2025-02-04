import express from "express";
import { createUser, findUserById, findAllUsers, updateUserById, modifyUserById } from "../controllers/userController.js";

const userRoute = express.Router();

//todo: route for creating user => POST  //create-user
userRoute.post("/", createUser);


//todo: route for find user by id => GET param(id)  //get-user
userRoute.get("/:id", findUserById);


//todo: route for find all user => GET //get-users
userRoute.get("/", findAllUsers);


//todo: route for update user by id => PUT param(id)  //update
userRoute.put("/:id", updateUserById);


//todo: route for update user by id => PATCH param(id) //update
userRoute.patch("/:id", modifyUserById);


//todo: route for delete user by id => DELETE param(id) //delete
userRoute.delete("//:id", )



//todo: route for delete all users => DELETE  //delete
userRoute.delete("/", )



export default userRoute;
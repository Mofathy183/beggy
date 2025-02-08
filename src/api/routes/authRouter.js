import express from 'express';
import { singUp, login } from '../controllers/authController.js';


const authRoute = express.Router();


//todo: route for singup => POST
authRoute.post("/singup", singUp)


//todo: route for start OAuth Facebook authenticate => GET
authRoute.get("/facebook", )


//todo: route for callback OAuth Facebook authenticate => GET
authRoute.get("facebook/callback", )


//todo: route for login => POST 
authRoute.post("/login", login)



//todo: route for logout => POST
authRoute.post("/logout", )


export default authRoute;
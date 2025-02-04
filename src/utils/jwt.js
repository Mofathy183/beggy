import jwt from "jsonwebtoken";
import { JWTConfig } from "../config/env.js";

export const singToken = (userId, email) => {
    const token = jwt.sign({id: userId, email: email}, JWTConfig.secret, {
        expiresIn: JWTConfig.expiresIn
    });

    return token;
}


export const verifyToken = (token) => {
    try {
        const verified = jwt.verify(token, JWTConfig.secret);
        return verified;
    }

    catch (error) {
        console.error("Invalid Token,", error.message);
        return null;
    }
}

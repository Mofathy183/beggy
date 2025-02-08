import jwt from "jsonwebtoken";
import { JWTConfig } from "../config/env.js";

export const singToken = (id) => {
    const token = jwt.sign({id: id}, JWTConfig.secret, {
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
        return false;
    }
}


// function create() {
//     const token = verifyToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQ0ZDc2OGZkLTQ0NTctNDcwOC1hYzIzLWIzMTA5OTg3YTRmMiIsImlhdCI6MTczODg1MDU0OSwiZXhwIjoxNzQ2NjI2NTQ5fQ.Uwgdx8cBlecNi9WHpYmc5nviJywocrFDr8FR_gV5hTQ");
//     console.log(token);
// }

// create();
import { singUpUser, loginUser } from "../../services/authService.js";
import { errorResponse, notFoundResponse, prismaErrorResponse } from "../../utils/errorResponse.js";
import { successSingUp, successLogin } from "../../utils/successResponse.js";
import { FacebookUserProvider } from "../../services/authService.js";


export const singUp = async (req, res) => {
    try {
        const { body } = req;

        const {newUser, token} = await singUpUser(body);

        if (newUser.error) return prismaErrorResponse(
            res, 
            newUser.error, 
            ["controllers", "singUp", "prisma error from new user error"]
        )

        console.log(newUser);

        return successSingUp(res, newUser, token);
    }

    catch (error) {
        return errorResponse(
            res, 
            error, 
            ["controllers", "singUp", "catch"], 
            "Failed to sing up"
        );
    }
};



export const login = async (req, res) => {
    try {
        const { body } = req;

        const { user, token } = await loginUser(body);

        if (user.error) return prismaErrorResponse(
            res, 
            user.error, 
            ["controllers", "login", "prisma error from login user error"]
        )

        return successLogin(res, user, token);
    }

    catch (error) {
        return errorResponse(
            res, 
            error, 
            ["controllers", "login", "catch"], 
            "Failed to login"
        );
    }
}




export const FacebookAuthent = async (accessToken, refreshToken, profile, done) => {
    try {
        const user = await FacebookUserProvider(profile);
        done(null, user);
    } catch (error) {
        done(error, false);
    }
}
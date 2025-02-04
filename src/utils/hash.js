import { hash, compare, genSalt } from "bcrypt";


export const hashingPassword = async (password) => {
    try {
        const saltRound = await genSalt(10);

        const hashedPassword = await hash(password, saltRound);

        return hashedPassword;
    }

    catch (error) {
        console.error(error);
        throw new Error("Error hashing password");
    }
}


export const verifyPassword = async (password, hashedPassword) => {
    try {
        const match = await compare(password, hashedPassword);
        return match;
    } 
    
    catch (error) {
        console.error(error);
        return false;
    }
}

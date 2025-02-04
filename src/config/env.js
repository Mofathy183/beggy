import dotenv from 'dotenv/config';

export const serverConfig = {
	port: process.env.PORT,
};


export const JWTConfig = {
	secret: process.env.JWT_SECRET,
	expiresIn: process.env.JWT_EXPIRES_IN,
};


export const coreConfig = {
    origin: process.env.CORE_ORIGIN,
}

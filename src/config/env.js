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


export const sessionConfig = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // cookie: {
    //     maxAge: 600000,
    //     secure: false,
    //     httpOnly: true,
    // },
}  


export const OAuthFacebookConfig = {
    clientId: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET_KEY,
    callbackURL: process.env.FACEBOOK_REDIRECT_URL,
    profileFields: ['id', 'displayName', 'email'] 
}

import passport from "passport";
import FacebookStrategy from "passport-facebook";
import { OAuthFacebookConfig } from "./env.js";
import { FacebookAuthent } from "../api/controllers/authController.js";


passport.use(new FacebookStrategy(OAuthFacebookConfig, FacebookAuthent))

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});





export default passport;
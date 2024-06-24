const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user.model");

passport.use(
    new LocalStrategy({
        usernameField: "email",
        passwordField: "password"
    }, async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            // username/email does not exists
            if (!user) {
                return done(null, false, { messages: "Username/Email is not registered!" });
            }
            // email exists, now we need to verify the password;
            const isMatched = await user.isValidPassword(password);
            return isMatched ? done(null, user) : done(null, false, { messages: "Incorrect Email/Password!" });
        } catch (error) {
            done(error);
        }
    })
);

// serializerUser means, for setting a user id inside the session, and the session automatically create the cookie;
// and this(below) all things are done behind the scene.
passport.serializeUser(function(user, done) {
    // console.log("Rahul", user.id);
    return done(null, user.id); // Store the user ID in the session
});

// similarly for the deserializer User, whenever a request come from browser, it contain cookie, and from that cookie
// we find the session, if the session exists, we would simply call done(err, user) callback function, 
passport.deserializeUser(async function(id, done) {
    try {
        const user = await User.findById(id); // Retrieve the full user object using the ID
        done(null, user); // Attach the user object to the request ( req.user );
    } catch (error) {
        done(error);
    }
});

const express = require("express");
const User = require("../models/user.model");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const {ensureLoggedOut, ensureLoggedIn} = require("connect-ensure-login");
const { registerValidator } = require("../utils/validators");

const router = express.Router();

router.get("/login", ensureLoggedOut({redirectTo: "/"}), async (req, res, next) => {
    res.render("login");
})

router.post("/login", ensureLoggedOut({redirectTo: "/"}), passport.authenticate("local", {
    // successRedirect: "/",
    successReturnToOrRedirect: "/", // if successReturnToOrRedirect present then is go to that route o/w go to "/" home route
    failureRedirect: "/auth/login",
    failureFlash: true
}));

router.get("/register", ensureLoggedOut({redirectTo: "/"}), async (req, res, next) => {
    // req.flash("error", "some error occured.");
    // const messages = req.flash(); // we can use this only once;
    // res.redirect("/auth/login")
    res.render("register");
})

router.post("/register", ensureLoggedOut({redirectTo: "/"}), 
registerValidator, async (req, res, next) => {
    // Node: since our req.body contain 3 fields(email, pass, pass2), and in our 
    // model there is only 2 entrie, so the confirm pass2 entry is going to be ignored by our model;
    try {
        const errors = validationResult(req);
        console.log("rahul", errors);
        if (!errors.isEmpty()) {
            errors.array().forEach((e) => {
                req.flash("error", e.msg);
            });
            res.render("register", { email: req.body.email, messages: req.flash() });
            return;
        }
        const { email } = req.body;
        const doesExist = await User.findOne({ email });
        if (doesExist) {
            res.redirect("/auth/register");
            return;
        }
        console.log("req.body", req.body);
        const user = new User(req.body);
        console.log("user", user);
        await user.save();
        // res.send(user);
        req.flash("info", `${user.email} is registered successfully, you can now login.`)
        res.redirect("/auth/login");
    } catch (error) {
        console.log("rahul2", error);
        next(error); // This is very important step to consider. (this err is being handled by the error handler we created)
    }
})

router.get("/logout", ensureLoggedIn({redirectTo: "/"}), async (req, res, next) => { // you can also use the post method as well;
    // res.status(200).send("Logout.");
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

module.exports = router;

// Middleware's
// function ensureAuthenticated(req, res, next){
//     if(req.isAuthenticated()){
//         next();
//     }else{
//         res.redirect("/auth/login");
//     }
// }

// function ensureNotAuthenticated(req, res, next){
//     if(req.isAuthenticated()){
//         res.redirect("back")
//     }else{
//         next();
//     }
// }
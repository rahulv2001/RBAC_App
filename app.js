const express = require("express");
const createHttpError = require("http-errors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const index_router = require("./routes/index.route");
const auth_router = require("./routes/auth.route");
const user_router = require("./routes/user.route");
const admin_routes = require("./routes/admin.route");
const session = require("express-session");
const connectFlash = require("connect-flash");
const passport = require("passport");
// const connectMongo = require("connect-mongo");
const MongoStore = require('connect-mongo');
const { ensureLoggedIn } = require("connect-ensure-login");
const { roles } = require("./utils/constants");
require("dotenv").config();

// Initialization
const app = express();

app.use(morgan("dev")); // HTTP request logger middleware for node.js; after running your server You will see the following output in your web server(dev/tiny).
app.use(express.static("public")); // for making the public folder available globally for each pages.
app.set("view engine", "ejs"); // to statically viewing the views page of ejs / fetching the pages.
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // By doing this, we need to specify the content type of our request;

// const MongoStore = new connectMongo(session);

// Init session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        // secure: true, // only when you are using the HTTPS server, not HTTP server;
        httpOnly: true
    },
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }) // this is used to persist our session in our mongo DB.
}));

// for passport js authentication
app.use(passport.initialize());
app.use(passport.session());
require("./utils/passport.auth"); // this whole module contain middleware;

// we need to make the local user available through the entire application;
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
})


// connect flash, for displaying flask messages
app.use(connectFlash());
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
})

// routes
app.use("/", index_router);
app.use("/auth", auth_router);
app.use("/user", ensureLoggedIn({ redirectTo: "/auth/login" }), user_router);
app.use("/admin", ensureLoggedIn({ redirectTo: "/auth/login" }), ensureAdminAccess, admin_routes);

app.use((req, res, next) => {
    next(createHttpError.NotFound()); // finding the error of each not found pages.
});

// This code is specificaly written to handle the error/ststus code, for any request.
// after deep driving into this: i've set this error code accordingly.
app.use((error, req, res, next) => { // notice that we have intensionaly made the first para as error para;
    error.status = error.status || 500; // b/c whenever we call next(error); is automatically detected;
    res.status(error.status); // this is for the browser sake.
    res.render("error_40x", { error });
});

const PORT = process.env.PORT || 3000;

mongoose
    .connect(process.env.MONGO_URI, {
        dbName: process.env.DB_NAME,
    })
    .then(() => {
        console.log("Connected to database...");
        app.listen(PORT, () => {
            console.log(`App is started listening on port ${PORT}.`);
        });
    })
    .catch((err) => console.log("Error while connecting to database!", err));

// function ensureAuthenticated(req, res, next){
//     if(req.isAuthenticated()){
//         next();
//     }else{
//         res.redirect("/auth/login");
//     }
// }

function ensureAdminAccess(req, res, next) {
    if (req.user.role === roles.admin) {
        next();
    } else {
        req.flash("warning", "You are not authorized to see this route!");
        res.redirect("/");
    }
}

// you can use this middleware anyware for moderator role user;
function ensureModeratorAccess(req, res, next) {
    if (req.user.role === roles.moderator) {
        next();
    } else {
        req.flash("warning", "You are not authorized to see this route!");
        res.redirect("/");
    }
}

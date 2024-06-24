const express = require("express");
const User = require("../models/user.model");
const mongoose = require("mongoose");
const { roles } = require("../utils/constants");

const router = express.Router();

router.get("/users", async(req, res, next) => {
    try {
        const users = await User.find();
        // res.send(users);
        res.render("manage-users", { users });
    } catch (error) {
        next(error);
    }
});

router.get("/user/:id", async(req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash('error', 'Invalid id');
            res.redirect('/admin/users');
            return;
          }
        const user = await User.findById(id);
        // res.send(users);
        res.render("profile", { person : user });
    } catch (error) {
        next(error);
    }
});

router.post("/update-role", async (req, res, next) => {
    try {
        const { id, role } = req.body;
        // checking for id & role in req.body;
        if(!id || !role){
            req.flash("error", "Invalid request");
            return res.redirect("back");
        }

        // check for valid mongoose id;
        if(!mongoose.Types.ObjectId.isValid(id)){
            req.flash("error", "Invalid id");
            return res.redirect("back");
        }

        // check for valid role;
        const rolesArray = Object.values(roles); // bringing the roles array;
        if(!rolesArray.includes(role)){
            req.flash("error", "Invalid role");
            return res.redirect("back");
        }

        // admin can't remore himself/herself as an admin;
        if(req.user.id === id){
            req.flash("error", "Admin can't remove themselves from admin, ask another admin.");
            return res.redirect("back");
        }

        //finaly update the user;
        const user = await User.findByIdAndUpdate(id, {role: role}, {new: true, runValidators: true});
        // here form runValidators, we can check whether it's value lies within the enum of schema;
        req.flash("info", `Updated role for ${user.email} to ${user.role}.`);
        return res.redirect("back");

        // res.redirect("/admin/users");
    } catch (error) {
        next(error);
    }
})

module.exports = router;


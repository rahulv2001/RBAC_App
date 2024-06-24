const express = require("express");

const router = express.Router();

router.get("/profile", async (req, res, next) => {
    // console.log(req.user);
    res.render("profile", { person : req.user });
})

module.exports = router;
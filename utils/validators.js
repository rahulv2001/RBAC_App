const { body } = require("express-validator");

module.exports = {
  registerValidator: [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Email must be a valid email.")
      .normalizeEmail()
      .toLowerCase(),
    body("password")
      .trim()
      .isLength(5)
      .withMessage("Password must have atleast 5 characters!"),
    body("password2").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not matched!");
      }
      return true;
    }),
  ],
};

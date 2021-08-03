const express = require("express");
const authController = require("./../controllers/authController");
const viewController = require("./../controllers/viewController");

const router = express.Router();

router.get("/signup", viewController.getSignupForm);

router.get("/", authController.isLoggedIn, viewController.getHomePage);

router.get("/login", authController.isLoggedIn, viewController.getLoginForm);

module.exports = router;

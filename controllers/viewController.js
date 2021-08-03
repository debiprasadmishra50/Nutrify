const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.getHomePage = (req, res) => {
    if (!req.loggedIn) res.redirect("/login");

    res.status(200).render("meals", { title: "Meals" });
};

exports.getSignupForm = (req, res) => {
    res.status(200).render("signup", { title: "Register" });
};

exports.getLoginForm = (req, res) => {
    res.status(200).render("signin", { title: "LogIn" });
};

const mongoose = require("mongoose");
const validator = require("validator").default;
const bcrypt = require("bcryptjs");
const _ = require("lodash");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please tell us your name!"],
    },
    username: {
        type: String,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email"],
    },
    caloriePerDay: {
        type: Number,
        required: [true, "Please provide calores per day"],
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: 8,
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            // This only works on CREATE and SAVE methods
            validator: function (el) {
                return el === this.password;
            },
            message: "Passwords are not the same",
        },
    },
});

/* 
    Document Middlewares
*/
userSchema.pre("save", async function (next) {
    // run only if password was modified
    if (!this.isModified("password")) return next();

    // hash the password with salt 12
    this.password = await bcrypt.hash(this.password, 12);

    // construct the username
    this.username = _.lowerCase(this.name).split(" ").join("") + "s";

    // delete the passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

/* 
    Custom Schema Methods
*/
userSchema.methods.correctPassword = async function (
    logInPassword,
    userPassword
) {
    return await bcrypt.compare(logInPassword, userPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;

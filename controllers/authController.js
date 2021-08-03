const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createAndSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);

    // Send the JWT via cookie
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    };

    res.cookie("jwt", token, cookieOptions);

    // Remove the passwords from output of sign up
    user.password = undefined;

    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user,
        },
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);

    createAndSendToken(newUser, 201, req, res);
});

exports.signin = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError("Please provide email and password!", 404));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password)))
        return next(new AppError("Incorrect Email or Password!", 401));

    createAndSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
    res.cookie("jwt", "loggedout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });

    res.status(200).json({
        status: "success",
    });
};

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    // 1. Get the token and it's existance
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    // console.log(token);
    if (!token)
        return next(
            new AppError(
                "You are not logged in! Please log in to get access.",
                401
            )
        );

    // 2. Validate/Verify the token
    const decodedData = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
    );
    // console.log(decodedData);

    // 3. Check if user still exists: [condition: user signed up, before sending getalltours data, user gets deleted, but the token will be there for 90 days nad can lead to vulnerability. hence check existance of user after verifying the jwt token]
    const currentUser = await User.findById(decodedData.id);
    if (!currentUser)
        return next(
            new AppError(
                "The user belonging to this token does no longer exist.",
                401
            )
        );

    // // 4. Check if user changed passwords after the token was issued
    // if (currentUser.changedPasswordAfter(decodedData.iat)) {
    //     return next(
    //         new AppError(
    //             "User recently changed password! Please login again.",
    //             401
    //         )
    //     );
    // }

    // Grant access to protected route
    req.user = currentUser; // for next requests, current user will be accessible
    res.locals.user = currentUser; // for pug templates, to access user object
    next();
});

/* 
    Check if a user is logged in or not by verifying the token in cookie, only for rendered apps
*/
exports.isLoggedIn = async (req, res, next) => {
    // 1. Get the token and it's existance
    if (req.cookies.jwt) {
        try {
            // 2. Validate/Verify the token
            const decodedData = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );
            // console.log(decodedData);

            // 3. Check if user still exists: [condition: user signed up, before sending getalltours data, user gets deleted, but the token will be there for 90 days nad can lead to vulnerability. hence check existance of user after verifying the jwt token]
            const currentUser = await User.findById(decodedData.id);
            if (!currentUser) return next();

            // 4. Check if user changed passwords after the token was issued
            // if (currentUser.changedPasswordAfter(decodedData.iat)) {
            //     return next();
            // }

            // console.log(currentUser);
            // There is a logged in user
            req.loggedIn = true;
            res.locals.user = currentUser; // it will make a user variable for all the pug templates
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles is an array: ["admin", "lead-guide"]
        // console.log(req.user.role, roles);
        if (!roles.includes(req.user.role))
            return next(
                new AppError(
                    "You do not have permission to perform this action",
                    403
                )
            );

        next();
    };
};

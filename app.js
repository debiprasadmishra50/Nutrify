const path = require("path");
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const userRouter = require("./routes/userRoutes");
const mealRouter = require("./routes/mealRoutes");
const viewRouter = require("./routes/viewRoutes");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.set("TZ", process.env.TZ);

app.use(express.static(path.join(__dirname, "public"))); // To serve static files

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev")); // for logging in console
}

app.use(cors());
app.options("*", cors());

app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

/* 
    Custom middleware
*/
app.use((req, res, next) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    const hours = today.getHours();
    const minutes = today.getMinutes();
    const seconds = today.getSeconds();

    req.requestTime = new Date(
        Date.UTC(year, month, day, hours, minutes, seconds)
    ).toISOString();
    // console.log(req.headers);
    // console.log(req.requestTime);
    next();
});

/* 
    Mount the routers
*/
app.use("/", viewRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/meals", mealRouter);

/* 
    For unknown routes
    all() is used for all get, post, patch, delete requests
*/
app.all("*", (req, res, next) => {
    const err = new AppError(
        `Can't find ${req.originalUrl} on this server!`,
        404
    );

    next(err);
});

/* 
    Error Handling
*/
app.use(globalErrorHandler);

module.exports = app;

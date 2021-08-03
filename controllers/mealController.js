const Meal = require("./../models/mealModel");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");

exports.getAllMeals = factory.getAll(Meal);

exports.createMeal = factory.createOne(Meal);

exports.getMeal = factory.getOne(Meal);

exports.updateMeal = factory.updateOne(Meal);

exports.deleteMeal = factory.deleteOne(Meal);

exports.checkCalorieStatus = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ username: req.user.username }); // get current user

    const today = new Date();
    const status = await Meal.aggregate([
        {
            $match: {
                $and: [
                    { username: req.user.username },
                    {
                        // prettier-ignore
                        datetime: {
                            $gte: new Date(`${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`),
                            $lt: new Date(`${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate() + 1}`),
                        },
                    },
                ],
            },
        },
        {
            $group: {
                _id: "$username",
                total: { $sum: "$calorie" },
            },
        },
    ]);

    // console.log(status);
    if (status.length === 0) return next();

    if (status[0].total > user.caloriePerDay) {
        // console.log(
        //     `Daily Limit Exceeds by ${
        //         status[0].total - user.caloriePerDay
        //     } units`
        // );
        // console.log(status);
        // console.log(user);

        req.isExceeding = true; // set the status true for total calorie exceeding the daily limit
        res.locals.isExceeding = true;
        req.exceedingUnit = status[0].total - user.caloriePerDay;
        return next();
    }
    req.isExceeding = false;

    // console.log(req.user);
    // console.log(req.isExceeding);

    next();
});

const mongoose = require("mongoose");
const validator = require("validator").default;
const slugify = require("slugify");

const mealSchema = mongoose.Schema({
    datetime: Date,
    foodName: {
        type: String,
        required: [true, "Please provide an username!"],
        trim: true,
        maxlength: [20, "A food name must have less than 20 characters"],
    },
    slug: String,
    calorie: {
        type: Number,
        required: [true, "Please provide calorie value!"],
    },
    description: {
        type: String,
        trim: true,
    },
    username: String,
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
mealSchema.pre("save", function (next) {
    // console.log(this);
    this.slug = slugify(this.foodName, { lower: true });
    next();
});

// QUERY MIDDLEWARE: runs before any find query
// Handled by APIFeatures limitFields
// mealSchema.pre(/^find/, function (next) {
//     this.select("-__v");
//     next();
// });

const Meal = mongoose.model("Meal", mealSchema);

module.exports = Meal;

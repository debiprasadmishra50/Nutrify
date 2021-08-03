const express = require("express");
const authController = require("./../controllers/authController");
const mealController = require("./../controllers/mealController");

const router = express.Router();

router.use(authController.protect);

router
    .route("/")
    .get(mealController.checkCalorieStatus, mealController.getAllMeals)
    .post(mealController.createMeal);

router
    .route("/:id")
    .get(mealController.getMeal)
    .patch(mealController.updateMeal)
    .delete(mealController.deleteMeal);

module.exports = router;

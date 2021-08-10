import "@babel/polyfill";
import { displayMeals } from "./displayData";
import { signup, login, logout } from "./userauth";
import { addMeal } from "./addMeal";

const meals = document.querySelector(".display--meals");
const signupForm = document.querySelector(".signup--form");
const loginForm = document.querySelector(".login--form");
const logoutBtn = document.querySelector(".logout-button");
const addMealForm = document.querySelector(".add-new-meal");
const fromDateForm = document.querySelector(".fromDate");
const sorting = document.querySelector("#sort");

const sortBy = document.querySelector("#by");
if (sortBy) {
    sortBy.addEventListener("change", (ev) => {
        const username = document.querySelector(".user-data").dataset.username;
        const fromDate = document.querySelector("#fromDate").value;

        if (ev.target.value == "+")
            displayMeals(username, fromDate, `+${sorting.value}`);
        if (ev.target.value == "-")
            displayMeals(username, fromDate, `-${sorting.value}`);
    });
}

const sortFunction = (username) => {
    sorting.addEventListener("change", (e) => {
        const fromDate = document.querySelector("#fromDate").value;
        let value = e.target.value;

        const sortBy = document.querySelector("#by");
        sortBy.addEventListener("change", (ev) => {
            if (ev.target.value == "+")
                displayMeals(username, fromDate, `+${value}`);
            if (ev.target.value == "-")
                displayMeals(username, fromDate, `-${value}`);
        });

        displayMeals(username, fromDate, `${sortBy.value}${e.target.value}`);
    });
};

if (meals) {
    const username = document.querySelector(".user-data").dataset.username;

    if (fromDateForm) {
        const fromDate = document.querySelector("#fromDate");

        fromDateForm.addEventListener("submit", (e) => {
            e.preventDefault();

            if (fromDate.value) displayMeals(username, fromDate.value);
            // return;
        });

        if (sorting) {
            sortFunction(username);
        }
    }

    displayMeals(username);
}

if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.querySelector("#name").value;
        const email = document.querySelector("#email").value;
        const caloriePerDay = document.querySelector("#calorie_per_day").value;
        const password = document.querySelector("#password").value;
        const passwordConfirm =
            document.querySelector("#passwordConfirm").value;

        if (name && email && caloriePerDay && password && passwordConfirm)
            signup(name, email, +caloriePerDay, password, passwordConfirm);
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.querySelector("#email").value;
        const password = document.querySelector("#password").value;

        if (email && password) login(email, password);
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
}

if (addMealForm) {
    addMealForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const foodName = document.querySelector("#foodName").value;
        const calorie = document.querySelector("#calorie").value;
        const description = document.querySelector("#description").value;

        if (foodName && calorie && description) {
            addMeal(foodName, +calorie, description);
        }
    });
}

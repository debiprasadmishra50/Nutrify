import axios from "axios";

export const signup = async (
    name,
    email,
    caloriePerDay,
    password,
    passwordConfirm
) => {
    try {
        const res = await axios({
            method: "POST",
            // url: "http://127.0.0.1:8000/api/v1/users/signup",
            url: "/api/v1/users/signup",
            data: {
                name,
                email,
                caloriePerDay,
                password,
                passwordConfirm,
            },
        });

        if (res.data.status === "success") {
            location.assign("/");
        }
    } catch (err) {
        console.log(err);
    }
};

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: "POST",
            // url: "http://127.0.0.1:8000/api/v1/users/signin",
            url: "/api/v1/users/signin",
            data: {
                email,
                password,
            },
        });

        if (res.data.status === "success") {
            location.assign("/");
        }
    } catch (err) {
        console.log(err);
    }
};

export const logout = async () => {
    try {
        const res = await axios({
            method: "GET",
            // url: "http://127.0.0.1:8000/api/v1/users/logout",
            url: "/api/v1/users/logout",
        });
        if (res.data.status === "success") {
            location.assign("/");
        }
    } catch (err) {
        console.log(err);
    }
};

import axios from "axios";

export const addMeal = async (foodName, calorie, description) => {
    try {
        const res = await axios({
            method: "POST",
            // url: "http://127.0.0.1:8000/api/v1/meals",
            url: "/api/v1/meals",
            data: {
                foodName,
                calorie,
                description,
            },
        });

        if (res.data.status === "success") {
            location.reload(true);
        }
    } catch (err) {
        console.log(err);
    }
};

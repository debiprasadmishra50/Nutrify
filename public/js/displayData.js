import axios from "axios";

const makeAction = async (element, data) => {
    const id = element.dataset.id;
    const method = element.className === "update" ? "PATCH" : "DELETE";

    try {
        const res = await axios({
            method,
            // url: `http://127.0.0.1:8000/api/v1/meals/${id}`,
            url: `/api/v1/meals/${id}`,
            data: method === "PATCH" ? data : undefined,
        });

        if (element.className === "delete") return location.reload(true);

        if (res.data.status === "success") location.reload(true);
    } catch (err) {
        console.log(err);
    }
};

const activateUpdateAndDelete = () => {
    const operation = document.querySelectorAll(".operation");

    if (operation) {
        operation.forEach((el) => {
            el.addEventListener("click", (e) => {
                let data = {};
                const rowData = e.target
                    .closest("tr")
                    .querySelectorAll("input");

                data.foodName = rowData[0].value;
                data.description = rowData[1].value;
                data.calorie = rowData[2].value;

                makeAction(e.target, data);
            });
        });
    }
};

export const displayMeals = async (username, fromDate = "") => {
    // let url = `http://127.0.0.1:8000/api/v1/meals?username=${username}`;
    let url = `api/v1/meals?username=${username}`;

    if (fromDate) url += `&dateFrom=${fromDate}`;

    try {
        const res = await axios({
            method: "GET",
            url: url,
        });

        const date = document.querySelector(".date");
        const data = document.querySelector("thead");
        const summary = document.querySelector(".summary");

        const results = res.data.data.data;
        // console.log(results);

        let d = "Meals Data from: ";

        if (results.length === 0) {
            d += new Date().toDateString();
            if (document.querySelector("h3"))
                document.querySelector("h3").remove(); // remove the add meal message if exists

            let html =
                "<h3>No Meals till now, Please add a meal to record your data.</h3>";

            date.textContent = d;
            date.insertAdjacentHTML("afterend", html);
            return;
        }

        if (document.querySelector("h3")) document.querySelector("h3").remove(); // remove the add meal message is exists

        d += new Date(results[0].datetime).toDateString();

        let html = "<tbody>",
            calorieSum = 0;
        results.map((el, index) => {
            const date = createDate(new Date(el.datetime));

            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${date.toLocaleTimeString()}</td>
                    <td><input value="${el.foodName}" /></td>
                    <td><input value="${el.description}" /></td>
                    <td><input value="${el.calorie}" /></td>
                    <td class="operation">
                        <span data-id=${
                            el._id
                        } class="update">Update</span>/<span data-id=${
                el._id
            } class="delete">Delete</span>
                    </td>
                </tr>
            `;
            calorieSum += el.calorie;
        });
        html += "</tbody>";

        if (fromDate && document.querySelector("tbody"))
            document.querySelector("tbody").remove(); // clear the table before adding the data, else it will just append the data.

        date.textContent = d;
        data.insertAdjacentHTML("afterend", html);

        let message = `<p>Total Calorie consumed ${
            fromDate ? "" : "today"
        } is ${calorieSum} units.</p>`;

        if (res.data.dailyLimitExceeding)
            message += `<p>Calorie Consumption of today is exceeding by ${res.data.exceedingAmount} units.</p>`;

        if (fromDate)
            summary.querySelectorAll("p").forEach((el) => el.remove()); // clear the messages else it will just append.

        summary.insertAdjacentHTML("beforeend", message);

        activateUpdateAndDelete();
    } catch (err) {
        console.log(err);
    }
};

/**
 * Returns a New date with local format at converting it to UTC then returns a new Date Object
 * @param {Date} date
 */
function createDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const hours = date.getHours() + 13;
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    return new Date(Date.UTC(year, month, day, hours, minutes, seconds));
}

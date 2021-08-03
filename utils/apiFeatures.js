const { Query } = require("mongoose");

class APIFeatures {
    /**
     * Takes a Query and request Parameters as input and returns the Required filtered Query with sort, pagination and field limits
     * @param {Query} query Query --> Model.find()
     * @param queryParams Request Parameter Object --> req.query
     * @returns Formatted Query
     */
    constructor(query, queryParams) {
        this.query = query;
        this.queryParams = queryParams;
    }

    filter() {
        let queryObj = { ...this.queryParams };

        // 1. FILTERING
        const excludeFields = ["page", "sort", "limit", "fields"]; // remove these fields as they're functionalities
        excludeFields.forEach((el) => delete queryObj[el]);

        // 2. ADVANCED FILTERING
        let queryStr = JSON.stringify(queryObj);
        // prettier-ignore
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // replace the gt with $gt to be run in DB
        queryObj = JSON.parse(queryStr);

        // BUILD QUERY
        this.query = this.query.find(queryObj);

        return this;
    }

    sort() {
        if (this.queryParams.sort) {
            const sortBy = this.queryParams.sort.split(",").join(" ");
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort("datetime");
        }

        return this;
    }

    limitFields() {
        if (this.queryParams.fields) {
            const fields = this.queryParams.fields.split(",").join(" ");
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select("-__v");
        }

        return this;
    }

    paginate() {
        const page = +this.queryParams.page || 1;
        const limit = +this.queryParams.limit || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;

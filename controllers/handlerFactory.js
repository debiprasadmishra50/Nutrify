const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");

exports.getAll = (Model) =>
    catchAsync(async (req, res, next) => {
        let filter = {};

        // Query for get meals from a particular day passed in query string
        if (req.query.dateFrom) {
            // prettier-ignore
            filter = {
                datetime: {
                    $gte: new Date(req.query.dateFrom),
                },
            }
            delete req.query.dateFrom; // remove the dateForm property from queryString as we've set the filter manually here
        } else {
            // console.log(req.requestTime);
            // Query for get meals from today: default
            const today = new Date(req.requestTime.split("T")[0]);
            // const month = today.getMonth();

            // const gte = new Date(req.requestTime.split("T")[0]);
            // console.log(gte);

            // prettier-ignore
            filter = {
                datetime: {
                    $gte: today
                    // $gte: new Date(`${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`),
                    // $gte: new Date(Date.UTC(today.getFullYear(), month === 11 ? month : month + 1, today.getDate())),
                    // $lt: new Date(`${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate() + 1}`),
                    // $lt: new Date(Date.UTC(today.getFullYear(), month === 11 ? month : month + 1, today.getDate() + 1)),
                },
            };
        }

        const features = new APIFeatures(Model.find(filter), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();

        const doc = await features.query;

        res.status(200).json({
            status: "success",
            requestedAt: req.requestTime,
            results: doc.length,
            dailyLimitExceeding: req.isExceeding,
            exceedingAmount: req.exceedingUnit,
            data: {
                data: doc,
            },
        });
    });

exports.createOne = (Model) =>
    catchAsync(async (req, res, next) => {
        // console.log(Model);
        const data = req.body;
        data.datetime = req.requestTime; // for Meal
        data.username = req.user.username;

        const doc = await Model.create(data);

        res.status(201).json({
            status: "success",
            data: {
                data: doc,
            },
        });
    });

exports.getOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const { id } = req.params;

        const doc = await Model.findById(id);

        if (!doc)
            return next(new AppError(`No document found with id ${id}`, 404));

        res.status(200).json({
            status: "success",
            data: {
                data: doc,
            },
        });
    });

exports.updateOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!doc)
            return next(
                new AppError(`No document found with id: ${req.params.id}`, 404)
            );

        res.status(200).json({
            status: "success",
            data: {
                data: doc,
            },
        });
    });

exports.deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc)
            return next(
                new AppError(`No document found with id: ${req.params.id}`, 404)
            );

        res.status(204).json({
            status: "success",
            data: null,
        });
    });

let asyncHandler = (fun) => ((req, res, next) => {
    Promise.resolve(fun(req, res, next)).catch((next) => (next(err)));
});

// Without using arrow function
// let asyncHandler = (fun) => {
//     return (err, req, res, next) => {
//         Promise.resolve(fun(err, req, res, next)).catch((next) => (next(err)));
//     }
// }
export { asyncHandler }

/*
// Another way to implement asyncHandler function
let asyncHandler = (fun) => async (err, req, res, next) => {
    try {
        await fun(err, req, res, next);
    }
    catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
}
*/

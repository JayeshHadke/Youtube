class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong", errors = [], stacks = "") {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.data = null;
        this.errors = errors;
        this.success = false;

        if (stacks) {
            this.stacks = stacks;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
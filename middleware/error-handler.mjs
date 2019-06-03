const errorHandler = async function (ctx, next) {
    try {
        await next();
    } catch (err) {
        let errStatus = err.status || 500;
        let errType = err.type || '';
        let errName = err.name;
        let errMsg = err.message || 'server error';

        process.env.NODE_ENV === 'development' && console.log(err);

        if (['MongoNetworkError', 'MongoError'].indexOf(errName) > -1) {
            const validationError = /duplicate key/.test(errMsg);

            if (validationError) {
                errStatus = 401;
                errType = 'validation_error'
            } else {
                errStatus = 500;
                errType = 'db_error';
            }
        }

        if (['ValidationError'].indexOf(errName) > -1) {
            errStatus = 401;
            errType = 'validation_error';
        }

        if (['AuthenticationError', 'JsonWebTokenError', 'TokenExpiredError'].indexOf(errName) > -1) {
            errStatus = 403;
            errType = 'authentication_error';
        }

        if (errName === 'ForbiddenError') {
            errStatus = 403;
            errType = 'permission_error';
        }

        if (errName === 'CastError') {
            // errStatus = 404;
            // errType = 'resource_error';
            // errMsg = `no such record: ${err.path}=${err.value}`;
            errStatus = 400;
            errType = 'cast_error';
            errMsg = err.message;
        }

        if (errName === 'ReferenceError') {
            errStatus = 500;
            errType = 'reference_error';
        }

        if (errName === 'TypeError') {
            errStatus = 500;
            errType = 'type_error';
        }

        if (errName === 'SyntaxError') {
            errStatus = 400;
            errType = 'syntax_error';
        }

        if (!errType) {
            // console.log(err)
        }

        ctx.status = errStatus;
        ctx.body = {
            error: {
                type: errType,
                message: errMsg
            }
        };
    }
};

export default errorHandler;
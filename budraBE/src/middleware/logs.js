const logRequest = (req, res, next) => {
    console.log('LOGS: ', req.path);
    next();
}

module.exports = logRequest;
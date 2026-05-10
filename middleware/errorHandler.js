// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);

  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Internal Server Error' : err.message,
    message: status === 500
      ? 'An unexpected error occurred. Please try again later.'
      : err.message,
  });
};

module.exports = errorHandler;

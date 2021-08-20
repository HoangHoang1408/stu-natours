class AppError extends Error {
  constructor(message, code) {
    super(message);
    this.statusCode = code;
    this.status = `${code}`.startsWith('4') ? 'error' : 'success';
    this.isOperational = true;
  }
}
module.exports = AppError;

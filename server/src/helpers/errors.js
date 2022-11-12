class SigninAuthError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'Signin Error';
    // Error.captureStackTrace(this, this.constructor);
  }
}

class NoTaskError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'Signin Error';
    // Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  SigninAuthError,
  NoTaskError,
};

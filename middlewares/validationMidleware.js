const { StatusCodes } = require('http-status-codes');
const ApiError = require('../utils/apiError');
const pick = require('../utils/pick');

const validate = (schema, options = {}) => (req, res, next) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));

  // Merging custom options with defaults
  const validationOptions = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
    ...options,
  };

  const { value, error } = schema.body.validate(object.body, validationOptions);

  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    return next(new ApiError(StatusCodes.BAD_REQUEST, errorMessage));
  }

  Object.assign(req, value);
  return next();
};

module.exports = validate;

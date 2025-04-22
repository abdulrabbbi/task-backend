const { modelToJSON } = require('./helpers');

const toJSON = (schema) => {
  let transform;
  if (schema.options.toJSON && schema.options.toJSON.transform) {
    transform = schema.options.toJSON.transform;
  }

  schema.options.toJSON = Object.assign(schema.options.toJSON || {}, {
    transform(doc, ret, options) {
      // Remove sensitive fields
      delete ret.password;
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;

      // Transform _id to id
      ret.id = ret._id.toString();
      delete ret._id;

      // Apply custom transform if exists
      if (transform) {
        return transform(doc, ret, options);
      }
    }
  });
};

module.exports = toJSON;
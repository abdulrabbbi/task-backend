/**
 * Helper functions for Mongoose plugins
 */

/**
 * Configures toJSON transformation for Mongoose schemas
 * @param {mongoose.Schema} schema - Mongoose schema to apply transformations to
 */
const modelToJSON = (schema) => {
    // Apply default toJSON options if none exist
    if (!schema.options.toJSON) schema.options.toJSON = {};
    
    // Store original transform function if it exists
    const originalTransform = schema.options.toJSON.transform;
    
    /**
     * Custom transform function for toJSON
     * @param {Object} doc - The mongoose document being transformed
     * @param {Object} ret - The plain object representation
     * @param {Object} options - The options
     */
    schema.options.toJSON.transform = function(doc, ret, options) {
      // Apply default transformations
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      delete ret.createdAt;
      delete ret.updatedAt;
      
      // Apply any existing transform function
      if (originalTransform) {
        return originalTransform(doc, ret, options);
      }
      
      return ret;
    };
  };
  
  /**
   * Adds paginate static method to Mongoose models
   * @param {mongoose.Schema} schema - Mongoose schema to add pagination to
   */
  const modelPaginate = (schema) => {
    /**
     * Pagination query
     * @param {Object} filter - Mongoose filter object
     * @param {Object} options - Pagination options
     * @param {string} [options.sortBy] - Sorting criteria (format: "field:asc|desc")
     * @param {number} [options.limit] - Maximum results per page (default: 10)
     * @param {number} [options.page] - Current page (default: 1)
     * @returns {Promise<Object>} Promise resolving to paginated results
     */
    schema.statics.paginate = async function(filter, options) {
      // Parse options with defaults
      const limit = options.limit && parseInt(options.limit, 10) > 0 
        ? parseInt(options.limit, 10) 
        : 10;
      const page = options.page && parseInt(options.page, 10) > 0 
        ? parseInt(options.page, 10) 
        : 1;
      const skip = (page - 1) * limit;
  
      // Configure sorting
      const sort = {};
      if (options.sortBy) {
        const parts = options.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
      }
  
      // Execute parallel queries
      const [totalResults, results] = await Promise.all([
        this.countDocuments(filter).exec(),
        this.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .exec()
      ]);
  
      // Calculate total pages
      const totalPages = Math.ceil(totalResults / limit);
  
      return {
        results,
        page,
        limit,
        totalPages,
        totalResults,
      };
    };
  };
  
  module.exports = {
    modelToJSON,
    modelPaginate
  };
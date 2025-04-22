const { StatusCodes } = require('http-status-codes');
const { createAdmin: createAdminService } = require('../services/adminServies');

/**
 * Controller to handle admin creation request
 */
const createAdmin = async (req, res, next) => {
  try {
    const admin = await createAdminService(req.body);
    console.log('StatusCodes.CREATED →', StatusCodes.CREATED);

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    next(error); 
  }
};

module.exports = {
  createAdmin,
};

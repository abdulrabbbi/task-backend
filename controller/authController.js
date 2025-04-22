const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const { Admin, Manager, RegularUser } = require("../models");
const ApiError = require("../utils/apiError");
const { jwt: jwtConfig } = require("../config/env");

// const login = async (email, password, role) => {
//   let user;

//   switch (role) {
//     case "admin":
//       user = await Admin.findOne({ email });
//       break;
//     case "manager":
//       user = await Manager.findOne({ email });
//       break;
//     case "user":
//       user = await RegularUser.findOne({ email });
//       break;
//     default:
//       throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid role");
//   }

//   if (!user || !(await user.isPasswordMatch(password))) {
//     throw new ApiError(StatusCodes.UNAUTHORIZED, "Incorrect email or password");
//   }

//   const token = jwt.sign({ sub: user.id, role }, jwtConfig.secret, {
//     expiresIn: jwtConfig.expire,
//   });
//   return { user, token };
// };

const login = async (email, password, role) => {
  let user;

  switch (role) {
    case 'admin':
      user = await Admin.findOne({ email });
      break;
    case 'manager':
      user = await Manager.findOne({ email });
      break;
    case 'user':
      user = await RegularUser.findOne({ email });
      break;
    default:
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid role');
  }

  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Incorrect email or password');
  }

  // 🧠 Generate tokens
  const accessToken = jwt.sign({ sub: user.id, role }, jwtConfig.secret, {
    expiresIn: jwtConfig.expire,
  });

  const refreshToken = jwt.sign({ sub: user.id, role }, jwtConfig.secret, {
    expiresIn: jwtConfig.expire,
  });

  return { user, accessToken, refreshToken };
};

// const loginUser = async (req, res, next) => {
//   try {
//     const { email, password, role } = req.body;
//     const { user, token } = await login(email, password, role);
//     res.send({ user, token });
//   } catch (error) {
//     next(error);
//   }
// };

const loginUser = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    const { user, accessToken, refreshToken } = await login(email, password, role);

    // 🍪 Set refreshToken as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production
      sameSite: 'Lax', // adjust if doing cross-site frontend/backend
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 📤 Send access token + user in response
    res.send({ user, accessToken });

  } catch (error) {
    next(error);
  }
};


const logout = async (req, res) => {
  // In a JWT system, logout is handled client-side by deleting the token
  res.status(StatusCodes.NO_CONTENT).send("logout successfully");
};

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Authentication required");
    }

    const decoded = jwt.verify(token, jwt.secret);
    req.user = decoded;
    res.status(StatusCodes.OK).json({ valid: true });
  } catch (error) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, "Invalid or expired token"));
  }
};

const refreshAccessToken = (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(new ApiError(401, 'Refresh token not found'));
  }

  try {
    const decoded = jwt.verify(refreshToken, jwt.secret);
    const accessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      jwt.secret,
      { expiresIn: '15m' }
    );

    res.status(200).json({ accessToken });
  } catch (err) {
    return next(new ApiError(403, 'Invalid or expired refresh token'));
  }
};

module.exports = {
  login: loginUser,
  logout,
  verifyToken,
  refreshAccessToken,
};

const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { jwt } = require('../config/env');
const { Admin, Manager, RegularUser } = require('../models');

const jwtOptions = {
  secretOrKey: jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    let user;
    switch (payload.role) {
      case 'admin':
        user = await Admin.findById(payload.sub);
        break;
      case 'manager':
        user = await Manager.findById(payload.sub);
        break;
      case 'user':
        user = await RegularUser.findById(payload.sub);
        break;
      default:
        return done(null, false);
    }
    
    if (!user) {
      return done(null, false);
    }
    
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

passport.use(new JwtStrategy(jwtOptions, jwtVerify));
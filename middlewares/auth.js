const jwt = require('jsonwebtoken');
var config = require('../config/api.json');
const secret = config.API_SECRET; //+ user's unique secret";

function jwtVerifyToken(req, res, next) {
  const token = req.headers.token || req.query.token || req.session.token;

  if (!token) {
    return res.status(403).send({ auth: false, message: 'No token provided.' });
  }
  return jwt.verify(token, secret, function (err, decoded) {
    if (err) {
      return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    }
    // if everything good, save to request for use in other routes
    req.userID = decoded.id;
    req.token = token
    req.decoded = decoded;

    if (req.url.startsWith('/admin')) {
      if (decoded.type == 'Admin')
        return next();
      else
        return res.status(500).send({ auth: false, message: 'Not enough types.' });
    }
    if (req.url.startsWith('/HOD')) {
      if (decoded.type == 'HOD')
        return next();
      else
        return res.status(500).send({ auth: false, message: 'Not enough types.' });
    }
    if (req.url.startsWith('/advisor')) {
      if (decoded.type == 'Advisor')
        return next();
      else
        return res.status(500).send({ auth: false, message: 'Not enough types.' });
    }
    return next();

  });
}
module.exports = jwtVerifyToken;
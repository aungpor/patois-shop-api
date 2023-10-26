const jwt = require("jsonwebtoken");
const config = require("../config");

const verify = (req, res, next) => {
  const authHeader = req.headers.token;
  try {
    if (authHeader) {
      const token = authHeader.split(" ")[1];

      jwt.verify(token, config.token, (err, user) => {
        if (err) {
          const authHeaderRefresh = req.headers.refreshtoken;
          if (authHeaderRefresh) {
            const tokenRefresh = authHeaderRefresh.split(" ")[1];
            jwt.verify(tokenRefresh, config.rtoken, (err, user) => {
              if (err) res.status(403).json("Token is not valid!");
              req.user = user;
              next();
            });
          } else {
            return res.status(401).json("You are not authenticated!");
          }      
        } else {
          req.user = user;
          next();       
        }
      });
    } else {
      return res.status(401).json("You are not authenticated!");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports = verify;

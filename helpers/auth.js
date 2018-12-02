require("dotenv");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
module.exports = {
  gateKeep: async (req, res, next) => {
    const token = req.headers["x-access-token"];
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }
    const decoded = jwt.verify(token, process.env.SECRET);

    let userData = await User.findOne({
      _id: decoded._id,
      email: decoded.email,
      loggedIn: decoded.loggedIn
    })
      .select("-password")
      .lean();
    if (userData) {
      req.user = userData;
      next();
    } else {
      res.status(401).json({
        message: "Unauthorized"
      });
    }
  }
};

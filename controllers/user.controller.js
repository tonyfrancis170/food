require("dotenv");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
module.exports = {
  login: async (req, res) => {
    try {
      let user = await User.findOne({
        email: req.body.email
      });
      if (!user) {
        return res.status(400).json({ message: "Invalid email/password" });
      }

      if (!user.validPassword(req.body.password)) {
        return res.status(400).json({ message: "Invalid email/password" });
      }
      user.loggedIn = new Date();
      user = await user.save();

      const { _id, email, name, loggedIn } = user.toObject(),
        tokenData = { _id, email, name, loggedIn };

      const secret = process.env.SECRET;
      var token = jwt.sign(tokenData, secret);

      res.status(200).json({
        message: "Login successfull",
        token
      });
    } catch (e) {
      return res.status(500).json({
        message: "Internal server error"
      });
    }
  },
  signup: async (req, res) => {
    try {
      let user = await User.findOne({ email: req.body.email }).lean();
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }
      let { generateHash } = new User(),
        newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: generateHash(req.body.password)
        });

      await newUser.save();

      return res.status(200).json({ message: "Signup successfull" });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Internal server error"
      });
    }
  },
  logout: async (req, res) => {
    try {
      await User.findOneAndUpdate(
        { email: req.user.email },
        {
          $set: {
            loggedIn: new Date()
          }
        }
      );

      return res.status(200).json({ message: "Logout successfull" });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Internal server error"
      });
    }
  }
};

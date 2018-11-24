require("dotenv");
const User = require("../models/user.model");
const Hotel = require("../models/hotel.model");
const jwt = require("jsonwebtoken");
const moment = require("moment");
module.exports = {
  login: async (req, res) => {
    try {
      let user = await User.findOne({
        email: req.body.email,
        isActive: true
      });
      if (!user) {
        return res.status(400).json({ message: "Invalid email/password" });
      }

      if (!user.validPassword(req.body.password)) {
        return res.status(400).json({ message: "Invalid email/password" });
      }
      user.loggedIn = new Date();
      user = await user.save();

      const { _id, email, name, loggedIn, role } = user.toObject(),
        tokenData = { _id, email, name, loggedIn };

      const secret = process.env.SECRET;
      var token = jwt.sign(tokenData, secret);

      res.status(200).json({
        message: "Login successfull",
        token,
        userData: { email, name, role }
      });
    } catch (e) {
      console.log(e);
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
          password: generateHash(req.body.password),
          role: req.body.isHotel ? 2 : 1
        });

      newUser = await newUser.save();

      newUser = newUser.toObject();

      // hotel registration block
      if (req.body.isHotel) {
        if (!req.body.locationId) {
          return res
            .status(400)
            .json({ message: "Location needed for hotel registration" });
        }

        let newHotel = new Hotel({
          user: newUser._id,
          location: req.body.locationId,
          stockTime: moment()
            .add(1, "days")
            .format()
        });

        await newHotel.save();
      }

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
  },

  deActivate: async (req, res) => {
    try {
      await User.update(
        { _id: req.body.userId },
        { $set: { isActive: false } }
      );

      return res.status(200).json({ message: "User successfully deactivated" });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Internal server error"
      });
    }
  },

  reActivate: async (req, res) => {
    try {
      await User.update({ _id: req.body.userId }, { $set: { isActive: true } });

      return res.status(200).json({ message: "User successfully activated" });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Internal server error"
      });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      let userData = await User.find({ role: { $ne: 3 } })
        .select("name role email isActive")
        .lean();

      return res
        .status(200)
        .json({ message: "Users loaded activated", data: userData });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Internal server error"
      });
    }
  },
  addComment: async (req, res) => {
    try {
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Internal server error"
      });
    }
  },

  modifyLikes: async (req, res) => {}
};

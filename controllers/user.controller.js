require("dotenv");
const User = require("../models/user.model");
const Hotel = require("../models/hotel.model");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const nodemailer = require("nodemailer");

const __ = require("../helpers/globals");
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
        if (user.failAttempts > 3) {
          user.failAttempts = 0;
          user.isActive = false;
          await user.save();
          return res.status(400).json({
            message:
              "Account has been disabled. Contact admin (admin@foodislife.com)"
          });
        } else {
          user.failAttempts =
            user.failAttempts === undefined ? 1 : user.failAttempts + 1;
          await user.save();
          return res.status(400).json({ message: "Invalid email/password" });
        }
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
            .add(3, "h")
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
  getUserInfo: async (req, res) => {
    try {
      let userData = await User.findOne({ _id: req.user._id })
        .select("name role email isActive activity")
        .lean();

      return res
        .status(200)
        .json({ message: "User loaded activated", data: userData });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Internal server error"
      });
    }
  },

  reservePackets: async (req, res) => {
    try {
      const { count, hotelId } = req.body;

      let hotelData = await Hotel.findOne({ _id: hotelId }).populate({
        path: "user",
        select: "name"
      });

      if (moment().isAfter(hotelData.stockTime)) {
        return res.status(200).json({
          message: "Food packets have expired"
        });
      }

      if (count > hotelData.foodPackets) {
        return res.status(200).json({
          message: "Not enough packets left"
        });
      }

      let hotelActivity = {
          info: `${req.user.name} reserved ${count} packet(s)`,
          time: new Date()
        },
        userActivity = {
          info: `You purchased ${count} packets from ${hotelData.user.name}`,
          time: new Date()
        };

      hotelData.foodPackets = hotelData.foodPackets - count;
      hotelData.activity.push(hotelActivity);
      await hotelData.save();

      await User.update(
        { _id: req.user._id },
        { $push: { activity: userActivity } }
      );

      return res.status(200).json({
        message: "Packets reserved successfully"
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Internal server error"
      });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      let user = await User.findOne({ email: req.body.email }).lean();

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      let token = jwt.sign({ _id: user._id }, "asdasdasdasd", {
        expiresIn: 600
      });

      let transporter = nodemailer.createTransport({
        service: "gmail",
        // port: 587,
        // secure: false, // true for 465, false for other ports
        auth: {
          user: "foodislife170@gmail.com",
          pass: "Sachin@001"
        }
      });

      let mailOptions = {
        from: "foodislife170@gmail.com", // sender address
        to: "le.ch4rm@gmail.com", // list of receivers
        subject: "Food is life | Password reset link", // Subject line

        html: `<a href="${token}">Click here to reset password</a>` // html body
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(400).json({
            message: "Link invalid/expired"
          });
        }
        return res.status(200).json({
          message: "Please check your inbox for the password reset link"
        });
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Internal server error"
      });
    }
  }
};

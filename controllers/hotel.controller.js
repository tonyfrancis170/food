require("dotenv");
const Hotel = require("../models/hotel.model");
const moment = require("moment");

const methods = {
  addFoodPackets: async (req, res) => {
    try {
      let { stockTime } = await Hotel.findOne({ user: req.user._id }).lean();
      let updateQuery = {
        $set: {
          stockTime: moment()
            .add(3, "h")
            .format()
        },
        $push: {
          activity: {
            info: `${req.body.count} packets were added`,
            time: new Date()
          }
        }
      };

      if (moment().isAfter(stockTime)) {
        updateQuery.$set.foodPackets = req.body.count;
      } else {
        updateQuery.$inc = {
          foodPackets: req.body.count
        };
      }

      await Hotel.update({ user: req.user._id }, updateQuery);
      let hotelData = await methods.fetchHotelInfo(req.user._id);
      return res
        .status(200)
        .json({ message: "Packets added successfully", data: hotelData });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Internal server error"
      });
    }
  },
  fetchHotelInfo: user => {
    return new Promise((resolve, reject) => {
      Hotel.findOne({ user })
        .populate([
          { path: "user", select: "name email" },
          { path: "comments" },
          { path: "location", select: "name" }
        ])
        .lean()
        .exec()
        .then(data => {
          data.activity = data.activity.reverse();
          resolve(data);
        })
        .catch(e => {
          reject(e);
        });
    });
  },
  getHotelInfo: async (req, res) => {
    try {
      let hotelData = await methods.fetchHotelInfo(req.user._id);

      return res.status(200).json({ message: "Info loaded", data: hotelData });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Internal server error"
      });
    }
  },

  getHotelsByLocation: async (req, res) => {
    try {
      let hotelData = await Hotel.find({ location: req.body.location })
        .populate([
          { path: "user", select: "name email" },
          { path: "comments" },
          { path: "location", select: "name" }
        ])
        .lean();

      return res
        .status(200)
        .json({ message: "Hotels loaded", data: hotelData });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Internal server error"
      });
    }
  }
};

module.exports = Object.freeze(methods);

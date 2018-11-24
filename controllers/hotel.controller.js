require("dotenv");
const Hotel = require("../models/hotel.model");
const moment = require("moment");

module.exports = {
  addFoodPackets: async (req, res) => {
    try {
      await Hotel.update(
        { _id: req.body.hotelId },
        {
          $inc: {
            foodPackets: req.body.count
          },
          $set: {
            stockTime: moment()
              .add(1, "days")
              .format()
          }
        }
      );

      return res.status(200).json({ message: "Count increased successfully" });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Internal server error"
      });
    }
  }
};

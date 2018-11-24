require("dotenv");
const Location = require("../models/location.model");

const methods = {
  listAllLocations: async (req, res) => {
    try {
      let locationData = await methods.getLocations();
      return res.status(200).json({
        message: "Locations loaded successfully",
        data: locationData
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Internal server error"
      });
    }
  },
  getLocations: () => {
    return new Promise((resolve, reject) => {
      Location.find()
        .lean()
        .exec()
        .then(data => {
          resolve(data);
        })
        .catch(e => {
          reject(e);
        });
    });
  },
  addLocation: async (req, res) => {
    try {
      let newLocation = new Location({
        name: req.body.location
      });
      newLocation = await newLocation.save();

      let locationData = await methods.getLocations();

      return res
        .status(200)
        .json({ message: "Location saved Successfully", data: locationData });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Internal server error"
      });
    }
  }
};

module.exports = Object.freeze(methods);

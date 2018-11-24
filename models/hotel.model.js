const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const hotelSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: "Location"
    },
    foodPackets: {
      type: Number,
      default: 50
    },
    stockTime: {
      type: Date
    },
    comments: {
      type: Schema.Types.ObjectId,
      ref: "Comment"
    },
    likes: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

//method to hash password
hotelSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//method to compare hashes
hotelSchema.methods.validPassword = function(password) {
  let hotel = this;
  return bcrypt.compareSync(password, hotel.password);
};
module.exports = mongoose.model("Hotel", hotelSchema);

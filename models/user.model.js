const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    // username: {
    //   type: String,
    //   required: true
    // },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: Number,
      enum: [1, 2, 3], // 1 - user , 2 - hotel , 3 - Admin
      default: 1
    },
    activity: [
      {
        info: {
          type: String
        },
        time: {
          type: Date
        }
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    },
    failAttempts: {
      type: Number,
      default: 0
    },
    loggedIn: {
      type: Date
    }
  },
  { timestamps: true }
);

//method to hash password
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//method to compare hashes
userSchema.methods.validPassword = function(password) {
  let user = this;
  return bcrypt.compareSync(password, user.password);
};
module.exports = mongoose.model("User", userSchema);

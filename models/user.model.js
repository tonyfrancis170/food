const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
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

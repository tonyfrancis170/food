require("dotenv").config();
const chalk = require("chalk");

function globals() {
  require("dotenv").config();

  const env = process.env.NODE_ENV;

  const globalObject = {
    log: (...entities) => {
      return env !== "live" ? console.log(...entities) : undefined;
    },
    // Validate request fields
    checkFields: (body, fields) => {
      let valid = Object.keys(body).reduce((acc, x) => {
        acc = fields.indexOf(x) > -1 && acc;
        return acc;
      }, true);
      return valid;
    }
  };

  return Object.freeze(globalObject);
}

module.exports = globals();

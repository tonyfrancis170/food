const user = require("../controllers/user.controller");

module.exports = (openRouter, apiRouter) => {
  /* Open routes */
  openRouter.route("/login").post(user.login);

  /* Protected routes */
  openRouter.route("/signup").post(user.signup);

  apiRouter.route("/dashboard").get((req, res) => {
    res.status(200).json({
      message: "token valid"
    });
  });

  apiRouter.route("/logout").get(user.logout);
};

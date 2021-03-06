const user = require("../controllers/user.controller");
const hotel = require("../controllers/hotel.controller");
const location = require("../controllers/location.controller");

function authorize(role) {
  const roles = {
    user: 1,
    hotel: 2,
    admin: 3
  };
  return function(req, res, next) {
    if (roles[role] !== req.user.role) {
      return res.status(403).json({
        message: "You're Unauthorized"
      });
    } else {
      next();
    }
  };
}

module.exports = (openRouter, apiRouter) => {
  /* Open routes */
  openRouter.route("/login").post(user.login);
  openRouter.route("/signup").post(user.signup);
  /* Protected routes */

  apiRouter.route("/dashboard").get((req, res) => {
    res.status(200).json({
      message: "token valid"
    });
  });

  apiRouter.route("/logout").get(user.logout);

  openRouter.route("/listAllLocations").get(location.listAllLocations);

  apiRouter
    .route("/getUserInfo")

    .get(user.getUserInfo);

  apiRouter
    .route("/addLocation")
    .all(authorize("admin"))
    .post(location.addLocation);

  apiRouter
    .route("/addFoodPackets")
    .all(authorize("hotel"))
    .put(hotel.addFoodPackets);

  apiRouter
    .route("/reActivate")
    .all(authorize("admin"))
    .put(user.reActivate);

  apiRouter
    .route("/deActivate")
    .all(authorize("admin"))
    .put(user.deActivate);

  apiRouter
    .route("/getAllUsers")
    .all(authorize("admin"))
    .get(user.getAllUsers);

  apiRouter
    .route("/getHotelInfo")
    .all(authorize("hotel"))
    .get(hotel.getHotelInfo);

  apiRouter.route("/getHotelsByLocation").post(hotel.getHotelsByLocation);

  apiRouter.route("/reservePackets").put(user.reservePackets);

  openRouter.route("/forgotPassword").post(user.forgotPassword);

  openRouter.route("/verifyEmailToken").post(user.verifyEmailToken);

  openRouter.route("/setPassword").post(user.setPassword);
};

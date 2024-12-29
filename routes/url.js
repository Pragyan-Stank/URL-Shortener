const express = require("express");
const router = express.Router();
const URL = require('../models/url');
const {restrictTo } = require("../middlewares/auth");

const {
  handleGetSignup,
  handlePostSignup,
  handleGetLogin,
  handlePostLogin,
  handlegenerateNewShortURL,
  handleRedirect,
  handleHomePage,
} = require("../controllers/url");

router.get("/", (req, res) => {
  res.redirect("/login");
});

router.get("/signup", handleGetSignup);
router.post("/signup", handlePostSignup);
router.get("/login", handleGetLogin);
router.post("/login", handlePostLogin);

router.get("/url", restrictTo(["NORMAL","ADMIN"]), handleHomePage);
router.post("/url", restrictTo(["NORMAL", "ADMIN"]), handlegenerateNewShortURL);

router.get("/admin/url", restrictTo(["ADMIN"]), async (req, res) => {
  const urls = await URL.find({}).populate("createdBy", "name");
  const analyticsData = urls.map((url) => ({
    userName: url.createdBy.name,
    shortID: url.shortID,
    redirectURL: url.redirectURL,
    totalVisits: url.visitHistory.length,
  }));

  res.render("index", { shortURL: null, history: analyticsData });
});

router.post("/logout", (req, res) => {
  // Clear the user token cookie to log out the user
  res.clearCookie("token");

  // Redirect to login page or home page after log out
  res.redirect("/login"); // Or redirect to "/"
});

// Place this route at the end to prevent conflicts
router.get("/:shortID", handleRedirect);

module.exports = router;

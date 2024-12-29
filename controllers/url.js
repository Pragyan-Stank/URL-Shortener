const shortid = require("shortid");
const URL = require("../models/url");
const User = require("../models/user");

const { v4: uuidv4 } = require("uuid");
const { setUser } = require("../service/auth");

// USER AUTHENTICATION:
async function handleGetSignup(req, res) {
  res.render("signup"); // Render signup form
}

async function handlePostSignup(req, res) {
  const { name, email, password } = req.body;

  if (name && email && password) {
    try {
      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        // Email exists, prompt to login
        return res.render("login", {
          message: "Email already registered. Please log in.",
          showLoginButton: true, // Flag to show login button
        });
      } else {
        // Create and save new user without hashing the password
        const newUser = new User({
          name,
          email,
          password, // Store the password as it is
        });

        await newUser.save();

        // Redirect to dashboard
        res.redirect("url");
      }
    } catch (err) {
      console.error("Error during signup:", err);
      res.status(500).render("signup", { message: "Error during signup." });
    }
  } else {
    res.status(400).render("signup", { message: "All fields are required!" });
  }
}

async function handleGetLogin(req, res) {
  res.render("login");
}

async function handlePostLogin(req, res) {
  const { email, password } = req.body;

  if (email && password) {
    try {
      // Check if the user exists
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        // Directly compare password (no bcrypt, assume plaintext password)
        if (existingUser.password === password) {
          // If the password matches, generate JWT and set in cookie
          const token = setUser(existingUser);
          res.cookie("token", token);
          res.redirect("url");
        } else {
          // Invalid password
          res
            .status(400)
            .render("login", { message: "Invalid email or password!" });
        }
      } else {
        // User not found
        res
          .status(400)
          .render("login", { message: "Invalid email or password!" });
      }
    } catch (err) {
      console.error("Error during login:", err);
      res.status(500).render("login", { message: "Error during login." });
    }
  } else {
    res
      .status(400)
      .render("login", { message: "Email and Password are required!" });
  }
}

async function handlegenerateNewShortURL(req, res) {
  const body = req.body;
  if (!body.url) {
    return res.status(400).json({ error: "URL is required" });
  }

  const shortId = shortid.generate();
  await URL.create({
    shortID: shortId,
    redirectURL: body.url,
    visitHistory: [],
    createdBy: req.user._id,
  });

  res.redirect("/url");
}

async function handleRedirect(req, res) {
  const shortID = req.params.shortID;

  try {
    const entry = await URL.findOne({ shortID });

    if (!entry) {
      return res
        .status(404)
        .render("error", { errorMessage: "Short URL not found" });
    }

    entry.visitHistory.push({ timestamp: Date.now() });
    await entry.save();

    return res.redirect(entry.redirectURL);
  } catch (error) {
    return res
      .status(500)
      .render("error", { errorMessage: "Internal Server Error" });
  }
}

async function handleHomePage(req, res) {
  try {
    if (!req.user) res.redirect("login");
    // Check if the logged-in user is an admin
    let urls;
    if (req.user.role === "ADMIN") {
      // Admin can see all users' URLs
      urls = await URL.find({}).populate("createdBy", "name");
    } else {
      // Normal user can only see their own URLs
      urls = await URL.find({ createdBy: req.user._id }).populate(
        "createdBy",
        "name"
      );
    }
    const analyticsData = urls.map((url) => ({
      userName: url.createdBy.name,
      shortID: url.shortID,
      redirectURL: url.redirectURL,
      totalVisits: url.visitHistory.length,
    }));

    res.render("index", { shortURL: null, history: analyticsData });
  } catch (error) {
    res.status(500).render("error", { errorMessage: "Internal Server Error" });
  }
}

module.exports = {
  handleGetSignup,
  handlePostSignup,
  handleGetLogin,
  handlePostLogin,
  handlegenerateNewShortURL,
  handleRedirect,
  handleHomePage,
};

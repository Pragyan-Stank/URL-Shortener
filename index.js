const express = require("express");
const { connectMongoDB } = require("./connection");
const urlRouter = require("./routes/url");
const cookieParser = require("cookie-parser");
const { checkForAuthentication } = require("./middlewares/auth");
const path = require('path');
const app = express();
const PORT = 8001;

const uri ="your_mongodb_connection_string";

connectMongoDB(uri).then(() => {
  console.log("Connected to MongoDB");
});

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(path.join(__dirname, "public")));


// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkForAuthentication);

app.use("/", urlRouter);

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});

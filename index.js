const express = require("express");
const { connectMongoDB } = require("./connection");
const urlRouter = require("./routes/url");
const cookieParser = require("cookie-parser");
const { checkForAuthentication } = require("./middlewares/auth");
const path = require('path');
const app = express();
const PORT = 8001;

const uri =
  "mongodb+srv://pragyansrivastavaofficial616:3050F2g7rSrCKT0r@pragyan.in3t6.mongodb.net/URLshortenerAuth?retryWrites=true&w=majority";

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
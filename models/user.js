const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: "NORMAL" }   
    },
  { timestamps: true }
);

const User = model("User", userSchema, "userData");

module.exports = User;
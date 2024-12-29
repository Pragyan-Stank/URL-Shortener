const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const urlSchema = new Schema(
  {
    shortID: {
      type: String,
      required: true,
      unique: true,
    },
    redirectURL: {
      type: String,
      required: true,
    },
    visitHistory: [
      {
        timestamp: {
          type: Number,
        },
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required:true,
    },
  },
  { timestamps: true }
);

const URL = model("Url", urlSchema, "URLs");

module.exports = URL;

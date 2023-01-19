import mongoose from "mongoose";

const { Schema, model } = mongoose;

const authorSchema = new Schema(
  {
    firstName: { type: mongoose.Types.ObjectId, required: true, ref: "Blogs" },
    lastName: { type: mongoose.Types.ObjectId, required: true, ref: "Blogs" },
  },
  {
    timestamps: true,
  }
);

export default model("Author", authorSchema);

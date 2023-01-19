import mongoose from "mongoose";

const { Schema, model } = mongoose;

const authorSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    blogs: [{ type: Schema.Types.ObjectId, ref: "Blogs" }],
  },
  {
    timestamps: true,
  }
);

export default model("Author", authorSchema);

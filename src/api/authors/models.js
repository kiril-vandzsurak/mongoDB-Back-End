import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const authorSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: false },
    role: { type: String, enum: ["User", "Admin"], default: "User" },
    googleId: { type: String, required: false },
    blogs: [{ type: Schema.Types.ObjectId, ref: "Blog" }],
  },
  {
    timestamps: true,
  }
);

authorSchema.pre("save", async function (next) {
  const currentAuthor = this;
  if (currentAuthor.isModified("password")) {
    const plainPW = currentAuthor.password;
    const hash = await bcrypt.hash(plainPW, 11);
    currentAuthor.password = hash;
  }
  next();
});

authorSchema.methods.toJSON = function () {
  const authorDocument = this;
  const author = authorDocument.toObject();

  delete author.password;
  delete author.createdAt;
  delete author.updatedAt;
  delete author.__v;
  return author;
};

authorSchema.static("checkCredentials", async function (email, password) {
  const author = await this.findOne({ email });

  if (author) {
    const passwordMatch = await bcrypt.compare(password, author.password);
    if (passwordMatch) {
      return author;
    } else {
      return null;
    }
  } else {
    return null;
  }
});

export default model("Author", authorSchema);

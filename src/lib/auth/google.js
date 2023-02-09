import GoogleStrategy from "passport-google-oauth20";
import AuthorModel from "../../api/authors/models.js";
import { createAccessToken } from "./tools.js";

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: `${process.env.BE_URL}/users/googleRedirect`,
  },
  async (_, __, profile, passportNext) => {
    try {
      const { email, firstName, lastName } = profile._json;
      const author = await AuthorModel.findOne({ email });
      if (author) {
        const accessToken = await createAccessToken({
          _id: author._id,
          role: author.role,
        });
        passportNext(null, { accessToken });
      } else {
        const newAuthor = new AuthorModel({
          firstName: firstName,
          lastName: lastName,
          email,
          googleId: profile.id,
        });
        const createdAuthor = await newAuthor.save();
        const accessToken = await createAccessToken({
          _id: createdAuthor._id,
          role: createdAuthor.role,
        });
        passportNext(null, { accessToken });
      }
    } catch (error) {
      console.log(error);

      passportNext(error);
    }
  }
);

export default googleStrategy;

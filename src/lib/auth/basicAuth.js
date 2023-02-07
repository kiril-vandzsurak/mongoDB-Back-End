import createHttpError from "http-errors";
import atob from "atob";
import AuthorsModel from "../../api/authors/models.js";

export const basicAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(
      createHttpError(
        401,
        "Provide credentials in the authorization header, please!"
      )
    );
  } else {
    const encodedCredentials = req.headers.authorization.split(" ")[1];
    const credentials = atob(encodedCredentials);
    const [email, password] = credentials.split(":");
    const author = await AuthorsModel.checkCredentials(email, password);
    if (author) {
      req.author = author;
      next();
    } else {
      next(createHttpError(401, "Credentials not ok!"));
    }
  }
};

import express from "express";
import createHttpError from "http-errors";
import AuthorsModel from "./models.js";
// import { basicAuthMiddleware } from "../../lib/auth/basicAuth.js";
import { adminOnlyMiddleware } from "../../lib/auth/adminOnly.js";
import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js";
import { createAccessToken } from "../../lib/auth/tools.js";
import passport from "passport";

const authorsRouter = express.Router();

authorsRouter.post("/register", async (req, res, next) => {
  try {
    const newAuthor = new AuthorsModel(req.body);
    const { _id } = await newAuthor.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

authorsRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const authors = await AuthorsModel.find();
    res.send(authors);
  } catch (error) {
    next(error);
  }
});

authorsRouter.get(
  "/googleLogin",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authorsRouter.get(
  "/googleRedirect",
  passport.authenticate("google", { session: false }),
  async (req, res, next) => {
    console.log(req.author);
    console.log("RREEQQQ::::::", req);
    res.redirect(`${process.env.FE_URL}?accessToken=${req.user.accessToken}`);
  }
);

authorsRouter.get("/:authorId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const author = await AuthorsModel.findById(req.params.authorId);
    if (author) {
      res.send(author);
    } else {
      next(
        createHttpError(404, `Author with id ${req.params.authorId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

authorsRouter.put(
  "/:authorId",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const updatedAuthor = await AuthorsModel.findByIdAndUpdate(
        req.params.authorId, // WHO you want to modify
        req.body, // HOW you want to modify
        { new: true, runValidators: true } // OPTIONS. By default findByIdAndUpdate returns the record PRE-MODIFICATION. If you want to get back the updated object --> new:true
        // By default validation is off here --> runValidators: true
      );

      if (updatedAuthor) {
        res.send(updatedAuthor);
      } else {
        next(
          createHttpError(
            404,
            `Author with id ${req.params.authorId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

authorsRouter.delete(
  "/:authorId",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const deletedAuthor = await AuthorsModel.findByIdAndDelete(
        req.params.authorId
      );
      if (deletedAuthor) {
        res.status(204).send();
      } else {
        next(
          createHttpError(
            404,
            `Author with id ${req.params.authorId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

authorsRouter.put("/:authorId/addNewBlogs", async (req, res, next) => {
  try {
    const updatedAuthor = await AuthorsModel.findByIdAndUpdate(
      req.params.authorId, // WHO you want to modify
      { $push: { blogs: req.body.blogId } }, // HOW you want to modify
      { new: true, runValidators: true } // OPTIONS. By default findByIdAndUpdate returns the record PRE-MODIFICATION. If you want to get back the updated object --> new:true
      // By default validation is off here --> runValidators: true
    );

    if (updatedAuthor) {
      res.send(updatedAuthor);
    } else {
      next(
        createHttpError(404, `Author with id ${req.params.authorId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// authorsRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
//   try {
//     const authors = await AuthorsModel.findById(req.author._id);
//     console.log("AUTHORS::::::::::::", authors);
//     res.send(authors);
//   } catch (error) {
//     next(error);
//   }
// });

authorsRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const author = await AuthorsModel.checkCredentials(email, password);
    if (author) {
      const payload = { _id: author._id, role: author.role };
      const accessToken = await createAccessToken(payload);
      res.send({ accessToken });
    } else {
      next(createHttpError(401, "Credentials are not ok!"));
    }
  } catch (error) {
    next(error);
  }
});

export default authorsRouter;

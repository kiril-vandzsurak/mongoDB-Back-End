import express from "express";
import BlogModel from "./models.js";
import createHttpError from "http-errors";
import CommentsModel from "../comments/models.js";

const blogsRouter = express.Router();

blogsRouter.post("/", async (req, res, next) => {
  try {
    const newBlog = new BlogModel(req.body);
    const { _id } = await newBlog.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

blogsRouter.get("/", async (req, res, next) => {
  try {
    const blogs = await BlogModel.find();
    res.send(blogs);
  } catch (error) {
    next(error);
  }
});

blogsRouter.get("/:blogId", async (req, res, next) => {
  try {
    const blog = await BlogModel.findById(req.params.blogId);
    if (blog) {
      res.send(blog);
    } else {
      next(
        createHttpError(404, `Blog with id ${req.params.blogId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

blogsRouter.put("/:blogId", async (req, res, next) => {
  try {
    const updatedBlog = await BlogModel.findByIdAndUpdate(
      req.params.blogId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedBlog) {
      res.send(updatedBlog);
    } else {
      next(
        createHttpError(404, `Blog with id ${req.params.blogId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

blogsRouter.delete("/:blogId", async (req, res, next) => {
  try {
    const deletedBlog = await BlogModel.findByIdAndDelete(req.params.blogId);
    if (deletedBlog) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `Blog with id ${req.params.blogId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

blogsRouter.post("/:blogId/commentsHistory", async (req, res, next) => {
  try {
    const writtenComment = await CommentsModel.findById(req.body.commentId, {
      _id: 0,
    });

    if (writtenComment) {
      const commentToLeave = {
        ...writtenComment.toObject(),
        commentDate: new Date(),
      };
      const updatedBlog = await BlogModel.findByIdAndUpdate(
        req.params.blogId,
        { $push: { commentsHistory: commentToLeave } },
        { new: true, runValidators: true }
      );

      if (updatedBlog) {
        res.send(updatedBlog);
      } else {
        next(
          createHttpError(404, `Blog with id ${req.params.userId} not found!`)
        );
      }
    } else {
      next(
        createHttpError(404, `Comment with id ${req.params.userId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

blogsRouter.get("/:blogId/commentsHistory", async (req, res, next) => {
  try {
    const blog = await BlogModel.findById(req.params.blogId);
    if (blog) {
      res.send(blog.commentsHistory);
    } else {
      next(
        createHttpError(404, `Blog with id ${req.params.userId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

export default blogsRouter;

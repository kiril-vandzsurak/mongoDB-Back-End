import express from "express";
import BlogModel from "./models.js";

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

export default blogsRouter;

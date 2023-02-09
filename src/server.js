import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import mongoose from "mongoose";
import blogsRouter from "./api/blogs/index.js";
import {
  unauthorizedErrorHandler,
  notFoundHandler,
  forbiddenErrorHandler,
  genericErrorHandler,
} from "./errorHandlers.js";
import commentsRouter from "./api/comments/index.js";
import authorsRouter from "./api/authors/index.js";
import googleStrategy from "./lib/auth/google.js";
import passport from "passport";

const server = express();
const port = process.env.PORT || 3001;

passport.use("google", googleStrategy);

server.use(cors());
server.use(express.json());
server.use(passport.initialize());

server.use("/blogs", blogsRouter);
server.use("/comments", commentsRouter);
server.use("/authors", authorsRouter);

server.use(unauthorizedErrorHandler);
server.use(notFoundHandler);
server.use(forbiddenErrorHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_KEY);

mongoose.connection.on("connected", () => {
  console.log("Connected!!!!!");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`Server is running on port ${port}`);
  });
});

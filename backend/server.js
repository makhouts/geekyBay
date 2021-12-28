if (process.env.NODE_ENV !== "production") {
  const dotenv = await import("dotenv");
  dotenv.config();
}

import express from "express";
import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import orderRouter from "./routes/orderRouter.js";

import {ValidationError} from "express-validation";
import authRouter from "./routes/authRouter.js";
import bodyParser from "body-parser";
import session from "express-session";
import pool from "./helper/dbConnection.js";
import passport from "passport";
import mySqlSession from "express-mysql-session";
import multer from 'multer'
import { local } from "./strategies/local.js";

import cors from 'cors';

const mySQLStore = mySqlSession(session);
const store = new mySQLStore({}, pool);

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 1, // 1 hour
      // secure: true TODO: when in prod
    },
  })
);

//TODO: change this for prod
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 // For legacy browser support
}

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//validation
app.use(function(err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(err)
  }

  return res.status(500).json(err)
});


app.use(passport.initialize());
app.use(passport.session()); // 

//todo: visible to who?
app.use("/users", userRouter);
app.use("/products", productRouter);
//todo: this should not be publicly visible information - only admin?
app.use("/orders", orderRouter);
app.use("/auth", authRouter);

app.listen(process.env.SERVER_PORT);

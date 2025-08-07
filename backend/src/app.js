import express from "express";
import cors from "cors"

import cookieParser from "cookie-parser";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials : true
}))


app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(cookieParser())

//routes

import userRouter from "./routes/users.routes.js"

//routes decliration

app.use("/api", userRouter)

import studentRoutes from "./routes/studentRoutes.js";
app.use("/api", studentRoutes);

import dashbordRoute from "./routes/dashbordRoute.js";
app.use("/api",dashbordRoute)


import marksRoute from "./routes/marksRoute.js"
app.use("/api", marksRoute)

import otpRoute from "./routes/otpRoute.js"
app.use("/api", otpRoute)

export {app}
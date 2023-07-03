//package to access env
require("dotenv").config();
//package applies automatically try catch to every middleware
require("express-async-errors");

//other packages
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");

//Routes
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const orderRouter = require("./routes/orderRoutes");

//Express
const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();
//MongoDB
const connectDB = require("./db/connect");
//Authentication
const authenticateUser = require("./middleware/authentication");
//Error Handlers
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

//Security packages
app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(xss());
app.use(cors());
app.use(mongoSanitize());

// http request logger package
app.use(morgan("tiny"));
//parses json middleware
app.use(express.json());
//parses cookies
app.use(cookieParser(process.env.JWT_SECRET));
//Make public folder a static asset and available
app.use(express.static("./public"));
//Allows Image upload & use a temp folder
app.use(fileUpload({ useTempFiles: true }));

//ROUTES
//homepage route
app.get("/", (req, res) => {
  res.send("<h1>E-commerce API</h1>");
});
app.get("/api/v1", (req, res) => {
  console.log(req.signedCookies);
  res.send("<h1>E-commerce API</h1>");
});
//other pages routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);
//error handling routes
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();

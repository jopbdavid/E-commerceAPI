const { StatusCodes } = require("http-status-codes");
const Review = require("../models/Review");
const Product = require("../models/Product");
const { BadRequestError, NotFoundError } = require("../errors");
const { checkPermissions } = require("../utils");
const notFound = require("../middleware/not-found");

//----------------------------------------
// CREATE REVIEW CONTROLLER
const createReview = async (req, res) => {
  req.body.user = req.user.id;
  const checkProduct = await Product.findOne({ _id: req.body.product });
  const alreadySub = await Review.findOne({
    user: req.user.id,
    product: req.body.product,
  });
  if (!checkProduct) {
    throw new NotFoundError("Product not found");
  }
  if (alreadySub) {
    throw new BadRequestError("Already submitted a review for this product");
  }
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};
//----------------------------------------

//----------------------------------------
// GET ALL REVIEWS CONTROLLER
const getAllReviews = async (req, res) => {
  const reviews = await Review.find({}).populate({
    path: "product",
    select: ["name", "company", "price"],
  });

  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};
//----------------------------------------

//----------------------------------------
//GET SINGLE REVIEW
const getSingleReview = async (req, res) => {
  const review = await Review.findOne({ _id: req.params });
  if (!review) {
    throw new NotFoundError("Review not found");
  }
  res.status(StatusCodes.OK).json({ review });
};
//----------------------------------------

//----------------------------------------
//UPDATE REVIEW
const updateReview = async (req, res) => {
  const { rating, title, comment } = req.body;

  const review = await Review.findOne({ _id: req.params.id });
  if (!review) {
    throw new NotFoundError("Review not found");
  }
  checkPermissions(req.user, review.user);
  review.rating = rating;
  review.title = title;
  review.comment = comment;
  review.save();

  res.status(StatusCodes.OK).json({ review });
};
//----------------------------------------

//----------------------------------------
//DELETE REVIEW
const deleteReview = async (req, res) => {
  const reviewDelete = await Review.findOne({ _id: req.params.id });
  if (!reviewDelete) {
    throw new NotFoundError("Review not found");
  }
  checkPermissions(req.user, reviewDelete.user);
  reviewDelete.remove();
  res.status(StatusCodes.OK).json({ msg: "Review deleted" });
};
//----------------------------------------

//----------------------------------------
//GET SINGLE PRODUCT REVIEWS
const getSingleProductReviews = async (req, res) => {
  const reviews = await Review.find({ product: req.params.id });

  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};
//----------------------------------------

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};

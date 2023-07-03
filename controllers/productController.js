const { StatusCodes } = require("http-status-codes");
const Product = require("../models/Product");
const { checkPermissions } = require("../utils");
const { BadRequestError, NotFoundError } = require("../errors");

//-------------------------
// CREATE PRODUCT CONTROLLER
const createProduct = async (req, res) => {
  checkPermissions(req.user, req.user.id);
  req.body.user = req.user.id;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};
//-------------------------

//-------------------------
// GET ALL PRODUCTS CONTROLLER
const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ products, count: products.length });
};
//-------------------------

//-------------------------
// GET SINGLE PRODUCTS CONTROLLER
const getSingleProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id }).populate(
    "reviews"
  );
  if (!product) {
    throw new NotFoundError(`No product with id: ${req.params.id}`);
  }
  res.status(StatusCodes.OK).json({ product });
};
//-------------------------

//-------------------------
// UPDATE PRODUCT CONTROLLER
const updateProduct = async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    { runValidators: true, new: true }
  );
  if (!product) {
    throw new NotFoundError(`No product with id: ${req.params.id}`);
  }
  res.status(StatusCodes.OK).json({ product });
};
//-------------------------

//-------------------------
// DELETE PRODUCT CONTROLLER
const deleteProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id });
  if (!product) {
    throw new NotFoundError(`No product with id: ${req.params.id}`);
  }
  await product.remove();
  res.status(StatusCodes.OK).json({ msg: "Product removed" });
};
//-------------------------

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};

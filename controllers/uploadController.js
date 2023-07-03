const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const Product = require("../models/Product");
const path = require("path");

// UPLOAD IMAGE CONTROLLER
const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new BadRequestError("No file Uploaded");
  }
  const productImage = req.files.image;

  if (!productImage.mimetype.startsWith("image")) {
    throw new BadRequestError("Invalid File Format.");
  }
  if (!productImage.size > 1024 * 1024) {
    throw new BadRequestError("Please upload image smaller than 1 MB");
  }
  const imagePath = path.join(
    __dirname,
    `../public/uploads/${productImage.name}`
  );
  await productImage.mv(imagePath);

  res
    .status(StatusCodes.ACCEPTED)
    .json({ image: { src: `/uploads/${productImage.name}` } });
};
//-------------------------

module.exports = uploadImage;

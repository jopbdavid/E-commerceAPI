const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} = require("../errors");
const { checkPermissions } = require("../utils");
const Order = require("../models/Order");
const Product = require("../models/Product");

//_____________________
//CREATE A FAKE STRIPE API
const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "someRandomValue";
  return { client_secret, amount };
};
//_____________________

//-------------------------
// GET ALL ORDERS CONTROLLER
const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  if (orders.length === 0) {
    throw new NotFoundError("No orders available");
  }
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};
//-------------------------
//-------------------------
// GET SINGLE ORDER CONTROLLER
const getSingleOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id });
  if (!order) {
    throw new NotFoundError("Order not found.");
  }

  checkPermissions(req.user, order.user);

  res.status(StatusCodes.OK).json({ order });
};
//-------------------------
//-------------------------
// GET ALL ORDERS FOR USER CONTROLLER
const getCurrentUserOrder = async (req, res) => {
  const id = req.user.id;
  const orders = await Order.find({ user: id });

  if (!orders || orders.length < 1) {
    throw new NotFoundError("No orders available for this user.");
  }
  res.status(StatusCodes.OK).json({ orders });
};
//-------------------------
//-------------------------
// CREATE ORDER CONTROLLER
const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;
  if (!cartItems || cartItems.length < 1) {
    throw new BadRequestError("No items in the cart");
  }
  if (!tax || !shippingFee) {
    throw new BadRequestError("Please provide tax or/and shipping fee values.");
  }
  let subtotal = 0;
  let orderItems = [];

  for (const item of cartItems) {
    const id = item.product;
    const product = await Product.findOne({ _id: id });
    if (!product) {
      throw new NotFoundError(`Product with id: ${id} does not exist.`);
    }
    subtotal = subtotal + item.price * item.amount;
    orderItems.push(item);
  }
  const total = subtotal + shippingFee + tax;
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  });

  req.body.user = req.user.id;
  req.body.subtotal = subtotal;
  req.body.total = total;
  req.body.cartItems = orderItems;
  req.body.clientSecret = paymentIntent.client_secret;

  const order = await Order.create(req.body);
  res.status(StatusCodes.CREATED).json({ order });
};
//-------------------------
//-------------------------
// UPDATE ORDER CONTROLLER
const updateOrder = async (req, res) => {
  const orderId = req.params.id;
  const paymentIntentId = req.body.paymentIntentId;

  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new NotFoundError("Order not found.");
  }
  checkPermissions(req.user, order.user);
  order.paymentIntentId = paymentIntentId;
  order.status = "paid";
  await order.save();

  res.status(StatusCodes.OK).json({ order });
};
//-------------------------

module.exports = {
  getAllOrders,
  getCurrentUserOrder,
  getSingleOrder,
  createOrder,
  updateOrder,
};

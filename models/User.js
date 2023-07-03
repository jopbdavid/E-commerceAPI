const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,

    required: [true, "Please provide name"],
    minLength: 3,
    maxLength: 50,
  },
  email: {
    type: String,
    validate: {
      message: "Please provide valid email",
      validator: validator.isEmail,
    },
    required: [true, "Please provide email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minLength: 6,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});

// NÃO USER ARROW NOTATION NOS PRE POST HOOKS PORQUE NÃO APONTAM PARA O USER (THIS KEYWORD)
//Pre Hook middleware type save ("validation") that runs before the hook (neste caso hashing da password.)
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// UserSchema.pre("findOneAndUpdate", async function () {
//   let data = this.getUpdate();
//   const salt = await bcrypt.genSalt(10);
//   data.password = await bcrypt.hash(data.password, salt);
// });

UserSchema.methods.comparePassword = async function (password) {
  const isMatch = await bcrypt.compare(password, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);

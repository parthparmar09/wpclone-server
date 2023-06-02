const User = require("../models/user");
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcrypt");
const fs = require("fs");


//user registration
const registerUser = async (req, res) => {
  try {
    const user = await User.create({ ...req.body });
  if (user) {
    const token = user.createJwt();
    res.status(StatusCodes.CREATED).json({ success: true, user, token });
  }
  } catch (error) {
    if(error.code == 11000){
      res.status(StatusCodes.BAD_REQUEST)
      throw new Error("email already exists")
    }
  }
};

//user login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.comparePass(password))) {
    const token = user.createJwt();
    res.status(StatusCodes.OK).json({ success: true, user, token });
  } else {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("invalid email or password");
  }
};

//changing password
const changePass = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new Error("all fields are required");
  }

  const newPassword = await bcrypt.hash(password, await bcrypt.genSalt(5));
  const user = await User.findOneAndUpdate(
    { email },
    { password: newPassword }
  );
  res.status(StatusCodes.OK).json({ success: true, msg: "password changed" });
};


//get a user's all information
const getUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ success: true, user: req.user });
};

//get users as per search keywords
const searchUser = async (req, res) => {
  const search = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: "i" } },
          { email: { $regex: req.query.keyword, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(search).find({ _id: { $ne: req.user._id } });
  if (users.length === 0) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("no user found");
  }
  res.status(200).json({ sucess: true, users });
};

//chane name or profile picture
const updateUser = async (req, res) => {
  let user;
  if (req.body.name) {
    user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { name: req.body.name },
      { new: true }
    );
  } else {
    user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { pfp: req.body.pfp },
      { new: true }
    );
  }

  res.status(200).json({ sucess: true, user });
};

module.exports = {
  registerUser,
  loginUser,
  changePass,
  getUser,
  searchUser,
  updateUser
};

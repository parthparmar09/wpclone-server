const Conversation = require("../models/conversation");
const User = require("../models/user");
const { StatusCodes } = require("http-status-codes");
const fs = require('fs');

//get a conversation with a user or start a new one if doesn't exists
const getOrAddConvo = async (req, res) => {
  if (req.body.grp) {
    let convo = await Conversation.find({ _id: req.body.id })
      .populate("members", "-password -contacts")
      .populate("admin", "-password -contacts")
      .populate("lastMsg");
    convo = await User.populate(convo, {
      path: "lastMsg.sender",
      select: "name pfp email",
    });
    res.status(StatusCodes.OK).json({ success: true, convo });
  } else {
    let convo = await Conversation.find({
      isGroup: false,
      $and: [{ members: req.user._id }, { members: req.body.id }],
    })
      .populate("members", "-password -contacts")
      .populate("lastMsg");

    convo = await User.populate(convo, {
      path: "lastMsg.sender",
      select: "name pfp email",
    });

    if (convo.length > 0) {
      res.status(StatusCodes.OK).json({ success: true, convo });
    } else {
      const conversation = {
        members: [req.user._id, req.body.id],
      };
      let convo = await Conversation.create(conversation);
      convo = await Conversation.find({ _id: convo._id }).populate(
        "members",
        "-password -contacts"
      );
      res.status(StatusCodes.OK).json({ success: true, convo });
    }
  }
};

//get all conversations of a user
const getAllConvo = async (req, res) => {
  let conversations = await Conversation.find({ members: req.user._id })
    .populate("members", "-password -contacts")
    .populate("admin", "-password -contacts")
    .populate("lastMsg")
    
    .sort({ updatedAt: -1 });
  conversations = await User.populate(conversations, {
    path: "lastMsg.sender",
    select: "name pfp email",
  });
  res.status(StatusCodes.OK).json({ success: true, conversations });
};

//create a new group
const createGroup = async (req, res) => {
  let membersArr = req.body.members;

  if (membersArr.length < 2) {
    res.status(StatusCodes.NOT_ACCEPTABLE);
    throw new Error("more than 2 members are required");
  }
  membersArr.push(req.user._id);
  const convo = await Conversation.create({
    isGroup: true,
    members: membersArr,
    admin: req.user._id,
    name: req.body.name,
    pfp: req.body.pfp,
  });

  const group = await Conversation.findOne({ _id: convo._id })
    .populate("members", "-password -contacts")
    .populate("admin", "-password -contacts");
  res.status(StatusCodes.OK).json({ success: true, group });
};

//add a member in a group
const addMember = async (req, res) => {
  const {email} = req.body
  if (!email) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("member is required");
  }

  const member = await User.findOne({email})
  if(!member){
    res.status(StatusCodes.NOT_FOUND)
    throw new Error("No user found")
  }

  let group = await Conversation.findOneAndUpdate(
    { _id: req.params.id, admin: req.user._id },
    { $push: { members: member._id } },
    { new: true }
  )
    .populate("members", "-password -contacts")
    .populate("admin", "-password -contacts");

  if (!group) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error("can't perform this action");
  }
  res.status(StatusCodes.OK).json({ success: true, group });
};
//remove a member from a group
const removeMember = async (req, res) => {
  if (!req.body.id) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("member is required");
  }
  let group = await Conversation.findOneAndUpdate(
    { _id: req.params.id, admin: req.user._id },
    { $pull: { members: req.body.id } },
    { new: true }
  )
    .populate("members", "-password -contacts")
    .populate("admin", "-password -contacts");

  if (!group) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error("can't perform this action");
  }
  res.status(StatusCodes.OK).json({ success: true, group });
};

//delete a chat or leave a group or delete a group(if admin)
const deleteConvo = async (req, res) => {
  const id = req.body.id;
  const user = req.user._id;
  let convo = await Conversation.findOne({ _id: id });
  if (convo.isGroup) {
    if (convo.admin.toString() === user.toString()) {
      convo = await Conversation.findOneAndDelete({
        _id: id,
        admin: user,
      });
      res.status(StatusCodes.OK).json({ success: true, msg: "group deleted" });
    } else {
      convo = await Conversation.findOneAndUpdate(
        { _id: id },
        { $pull: { members: user } }
      );
      res.status(StatusCodes.OK).json({ success: true, msg: "group left" });
    }
  } else {
    convo = await Conversation.findOneAndDelete({ _id: id });
    res.status(StatusCodes.OK).json({ success: true, msg: "chat deleted " });
  }
};

//update name or profile picture of a group
const updateGroup = async (req, res) => {
  let group;
  if (req.body.pfp) {
    const temp = await Conversation.findOne({ _id: req.params.id });
    group = await Conversation.findOneAndUpdate(
      { _id: req.params.id },
      { pfp: req.body.pfp },
      { new: true }
    )
      .populate("members", "-password -contacts")
      .populate("admin", "-password -contacts");
      
  } else {
    group = await Conversation.findOneAndUpdate(
      { _id: req.params.id },
      { name: req.body.name },
      { new: true }
    )
      .populate("members", "-password -contacts")
      .populate("admin", "-password -contacts");
  }
  res.status(StatusCodes.OK).json({ success: true, group });
};

module.exports = {
  getOrAddConvo,
  getAllConvo,
  createGroup,
  addMember,
  removeMember,
  deleteConvo,
  updateGroup,
};

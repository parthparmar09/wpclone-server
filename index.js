//dotenv for env variables
require("dotenv").config();

//for asyncrhonous error handling
require("express-async-errors");

const express = require("express");
const connectDb = require("./db/connectDb");
const app = express();

//cors for cross-origin requests
const cors = require("cors");
app.use(cors());

//json parser
app.use(express.json());

//jwt verification middleware
const authorization = require("./middleware/auth");

// static files
app.use(express.static("public"));
//all routes
app.use("/api/user", require("./routes/user"));
app.use("/api/img", require("./routes/picUpload"));
app.use("/api/convo", authorization, require("./routes/conversation"));
app.use("/api/msg", authorization, require("./routes/message"));

//adding error handling middlewares
const { notFound, errorHandler } = require("./middleware/errorHandler");
app.use(notFound);
app.use(errorHandler);

//starting the server
const port = process.env.PORT || 5000;

connectDb(process.env.DB_URL)
  .then(() => {
    console.log("db connected");
  })
  .catch((err) => {
    console.log(err);
    process.exit();
  });

var server = app.listen(port, () => {
  console.log("app started");
});

//socket io configuration
const io = require("socket.io")(server, {
  pingTimeout: 60000,
});

//event handling
io.on("connection", (socket) => {
  socket.on("joinChat", (id) => {
    socket.join(id);
    socket.emit("chatJoined", id);
  });

  socket.on("joinRoom", (id) => {
    socket.join(id);
    socket.emit("roomJoined", id);
  });

  socket.on("sendMessage", (msg) => {
    msg.convo_id.members.forEach((m) => {
      if (m == msg.sender._id) return;
      socket.in(m).emit("receiveMessage", msg);
    });
  });

  socket.on("imTyping", (obj) => {
    socket.to(obj.id).emit("isTyping", obj);
  });
  socket.on("imNotTyping", (id) => {
    socket.to(id).emit("isNotTyping", id);
  });

  socket.on("clearingChat", (obj) => {
    socket.to(obj.id).emit("chatCleared", obj);
  });
  socket.on("deleteChat", (obj) => {
    socket.to(obj.id).emit("chatDeleted", obj);
  });

  socket.on("addMember", (obj) => {
    socket.to(obj._id).emit("memberAdded", obj);
  });

  socket.on("removeMember", (obj) => {
    const id = obj.convo._id;
    socket.to(id).emit("memberRemoved", obj);
  });
});



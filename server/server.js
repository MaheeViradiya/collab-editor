const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const Document = require("./models/Document");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

mongoose.connect("mongodb://127.0.0.1:27017/collab-editor");

io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    const document = await findOrCreateDocument(documentId);

    socket.join(documentId);
    socket.emit("load-document", document.data);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(documentId, { data });
    });
  });
});

async function findOrCreateDocument(id) {
  if (!id) return;
  const doc = await Document.findById(id);
  if (doc) return doc;
  return await Document.create({ _id: id, data: "" });
}

server.listen(5000, () => console.log("Server running on port 5000"));

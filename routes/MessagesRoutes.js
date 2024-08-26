const { Router } = require("express");
const verifyToken = require("../middlewares/AuthMiddleware.js");
const {getMesssage, uploadFile,} = require("../controllers/MessagesControllers.js");
const multer = require("multer");


const messagesRoutes = Router();
const upload = multer({dest:"uploads/files"})

messagesRoutes.post("/get-messages", verifyToken, getMesssage);
messagesRoutes.post("/upload-file", verifyToken, upload.single("file"), uploadFile);

module.exports = messagesRoutes ;

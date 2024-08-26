const express = require("express");
const verifyToken = require("../middlewares/AuthMiddleware.js");
const { searchContact, getContactForDMList } = require("../controllers/ContactControllers.js");

const contactRoutes = express.Router();


contactRoutes.post("/search", verifyToken, searchContact);
contactRoutes.get("/get_contact-for-dm", verifyToken, getContactForDMList);


module.exports = contactRoutes;
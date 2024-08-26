const express = require("express");
const { signup, login, getUserInfo, updateProfile, addProfileImage,removeProfileimage, logout } = require("../controllers/AuthController.js");
const verifyToken = require("../middlewares/AuthMiddleware.js");
const multer  = require("multer")

const upload = multer({dest:"uploads/profiles"})


const authRoutes = express.Router();


authRoutes.post("/signup", signup); 

authRoutes.post("/login", login);

authRoutes.get("/user-info", verifyToken, getUserInfo);
authRoutes.post("/update-profile", verifyToken, updateProfile);
authRoutes.post("/add-profile-image", verifyToken,upload.single("profile-image"), addProfileImage);
authRoutes.delete("/remove-profile-image", verifyToken, removeProfileimage);
authRoutes.post("/logout", logout);


module.exports=authRoutes;
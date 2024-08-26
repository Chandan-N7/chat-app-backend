const jwt = require("jsonwebtoken")
const User = require("../models/UserModel.js");
const { compare } = require("bcrypt");
const fs = require("fs");
const path = require("path");

const maxAge = 3 * 24 * 60 * 60 * 1000;
// const maxAge = 3600000;
const createJwt = (email, userId) => {
    return jwt.sign({ email, userId }, process.env.JWT_KEY, { expiresIn: maxAge });
}

// signup
const signup = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send("Email and password is required")
        }
        const eamilExist = await User.findOne({ email });
        if (eamilExist) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const user = await User.create({
            email,
            password
        });
        res.cookie("jwt", createJwt(email, user.id), {
            maxAge,
            secure: true,
            sameSite: "None",
        });
        return res.status(201).json({
            id: user.id,
            email: user.email,
            profileSetup: user.profileSetup
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send("internal server errror")
    }
}


// Login 
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send("invalid credentials");
        }

        const auth = await compare(password, user.password);
        if (!auth) {
            return res.status(400).send("invalid credentials")
        }

        res.cookie("jwt", createJwt(email, user.id), {
            maxAge,
            secure: true,
            sameSite: "None",
        });
        return res.status(200).json({
            id: user.id,
            email: user.email,
            profileSetup: user.profileSetup,
            firstName: user.firstName,
            lastName: user.lastName,
            image: user.image,
            color: user.color
        })




    } catch (error) {
        console.log(error)
        return res.status(500).send("internal server errror")
    }
}

// getUserInfo 
const getUserInfo = async (req, res, next) => {
    try {
        const userData = await User.findById(req.userId);
        if (!userData) {
            return res.status(404).send("user with the given id  not found")
        }
        return res.status(200).json({
            id: userData.id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color
        })




    } catch (error) {
        console.log(error)
        return res.status(500).send("internal server errror")
    }
}


// updateProfile 
const updateProfile = async (req, res, next) => {
    try {
        const { userId } = req;
        const { firstName, lastName, color } = req.body;
        if (!firstName || !lastName) {
            return res.status(404).send("Firstname, Lastname and Color is required")
        }

        const userData = await User.findByIdAndUpdate(userId,
            {
                firstName,
                lastName,
                color,
                profileSetup: true
            },
            { new: true, runValidators: true });

        return res.status(200).json({
            id: userData.id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send("internal server errror")
    }
}

// add profile image
const addProfileImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(404).send("File is required.")
        }
        const date = Date.now();
        
        let fileName = "uploads/profiles/" + date +req.file.originalname;
        fs.renameSync (req.file.path,fileName)
       
        const updateUser = await User.findByIdAndUpdate(
            req.userId,
            { image: fileName },
            { new: true, runValidators: true })

        return res.status(200).json({
            image: updateUser.image
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send("internal server errror")
    }
}

// add removeProfileimage 
const removeProfileimage = async (req, res, next) => {
    try {
        const { userId } = req;

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).send("User not found")
        }
        if (user.image) {
            fs.unlinkSync(user.image)
        }
        user.image = null;
        await user.save()

        return res.status(200).send("Profile image remove successfully")
    } catch (error) {
        console.log(error)
        return res.status(500).send("internal server errror")
    }
}

// Logout
const logout = async (req, res, next) => {
    try {
        
        res.cookie("jwt","",{maxAge:1,secure:true, sameSite:null})
        return res.status(200).send("logout successfull")
    } catch (error) {
        console.log(error)
        return res.status(500).send("internal server errror")
    }
}


module.exports = { signup, login, getUserInfo, updateProfile, addProfileImage, removeProfileimage,logout };
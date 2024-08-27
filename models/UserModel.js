const mongoose = require("mongoose")
const { genSalt, hash } = require("bcryptjs");
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    firstName: {
        type: String,
        required:false,
    },
    lastName: {
        type: String,
        required: false,
    },
    image:{
        type:String,
        required:false,
    },
    color: {
        type: Number,
        required:false,
    },
    profileSetup: {
        type: Boolean,
        default:false,
    },
})

userSchema.pre("save", async function(next){
    const user = this; // Access the user document being saved

    // Only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();
    try {
        // Generate a salt
        const salt = await genSalt(10);

        // Hash the password along with the new salt
        const hashedPassword = await hash(user.password, salt);

        // Replace the plain password with the hashed password
        user.password = hashedPassword;
        next();
    } catch (error) {
        next(error); // Pass any errors to the next middleware
    }
})

const User = mongoose.model('User', userSchema);

module.exports = User;
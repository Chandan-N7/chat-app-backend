
const User = require("../models/UserModel.js")
const Message = require("../models/MessagesModel.js")
const mongoose = require("mongoose")


// Search contact
const searchContact = async (req, res, next) => {
    try {
        const { searchTerm } = req.body
        if (searchTerm === undefined || searchTerm === null) {
            return res.status(400).send("searchTerm is required")
        }

        const sanitizeSearchTerm = searchTerm.replace(
            /[.*+?^${}()|[/]\\]/g,
            "\\$&"
        )
        const regex = new RegExp(sanitizeSearchTerm, "i")

        const contacts = await User.find({
            $and: [
                { _id: { $ne: req.userId } },
                {
                    $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
                },
            ]
        })
        return res.status(200).json({ contacts })
    } catch (error) {
        console.log(error)
        return res.status(500).send("internal server errror")
    }
}


// getContactForDMList
const getContactForDMList = async (req, res, next) => {
    try {
        let { userId } = req;
        userId = new mongoose.Types.ObjectId(userId)

        const contacts = await Message.aggregate([
            {
                $match: {
                    $or: [{ sender: userId }, { recipient: userId }],
                }
            },
            {
                $sort: { timestamp: -1 },
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ["$sender", userId] },
                            then: "$recipient",
                            else: "$sender",
                        },
                    },
                    lastMessageTime: { $first: "$timestamp" },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "contactInfo",
                }
            },
            {
                $unwind: "$contactInfo"
            },
            {
                $project: {
                    _id: 1,
                    lastMessageTime: 1,
                    email:"$contactInfo.email",
                    firstName:"$contactInfo.firstName",
                    lastName:"$contactInfo.lastName",
                    image:"$contactInfo.image",
                    color:"$contactInfo.color",
                }
            },
            {
                $sort:{lastMessageTime: -1}
            }
        ])
        if (!userId) {
            return res.status(400).send
        }
        return res.status(200).json({ contacts })
    } catch (error) {
        console.log(error)
        return res.status(500).send("internal server errror")
    }
}

module.exports = { searchContact, getContactForDMList }
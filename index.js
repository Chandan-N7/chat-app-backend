const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const mongoose = require("mongoose")
const authRoutes = require("./routes/AuthRoutes.js")
const contactRoutes = require("./routes/ContactRoutes.js")
const setupSocket = require("./socket.js")
const messagesRoutes = require("./routes/MessagesRoutes.js")

dotenv.config();

const app = express()
const port = process.env.PORT || 3000;
const databaseURL = process.env.DATABASE_URL;

app.use(
    cors({
        origin: [process.env.ORIGIN],
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
        credentials: true,
    })
);

app.use('/uploads/profiles', express.static('uploads/profiles'))
app.use('/uploads/files', express.static('uploads/files'))

app.use(cookieParser());
app.use(express.json());


app.use('/api/auth', authRoutes)
app.use('/api/contacts', contactRoutes)
app.use('/api/messages', messagesRoutes)


const server = app.listen(port, () => {
    console.log(`Server is runing at http://localhost:${port}`)
});

setupSocket(server)

mongoose.connect(databaseURL).then(() => {
    console.log("Database connection successful")
}).catch(err => console.log("database connection error"));
import dotenv from 'dotenv';
dotenv.config();

import mongoose from "mongoose";
import app from "./app.js";

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/react-posts';
mongoose.connect(mongoUrl, {dbName: 'react-posts'})
    .then(() => {
        console.log('database connected')
        app.listen(3000, () => {
            console.log('Server is running on port 3000')
        })
    })
    .catch((err) => {
        console.log('Database connection error:', err.message);
    })
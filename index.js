import dotenv from 'dotenv';
dotenv.config();

import mongoose from "mongoose";
import app from "./app.js";

mongoose.connect('mongodb+srv://orang1:IqjDxPl28HGdw4tV@cluster0.r3jjxai.mongodb.net/', {dbName: 'react-posts'})
    .then(() => {
        console.log('database connected')
        app.listen(3000, () => {
            console.log('Server is running on port 3000')
        })
    })
    .catch((err) => {
        console.log('Database connection error:', err.message);
    })
import express from 'express';
import postRouter from './routers/post.js'
import userRouter from './routers/user.js'
import cors from 'cors'
import session from "express-session"
import MongStore from "connect-mongo"
import passport from './config/passport.js';
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

const app = express();
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,
}));
app.use(express.json());
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }));

// app.use(session({
//     secret: 'nighterford',
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({
//         mongoUrl: 'mongodb://localhost:27017/express-test'
//     }),
//     cookie: {
//         httpOnly: true,
//         maxAge: 1000 * 60 * 60, // lifetime of the cookie in milliseconds
//     }
// }))

// app.use(passport.initialize())
// app.use(passport.session())

const middleware1 = (req, res, next) => {
    req.test = 'This is set by middleware1';
    next();
}

const middleware2 = (req, res, next) => {
    console.log(req.test);
    req.test2 = 'This is set by middleware2';
    throw new Error('error!');
}

app.get('/', middleware1, middleware2, (req, res) => {
    res.json([req.test, req.test2]);
})

// app.use(passport.authenticate('session'));

app.use((req, res, next)=> {
    if(!req.cookies['token']) {
        return next();
    }
    passport.authenticate(
        "jwt", 
        {session: false}
    )(req, res, next)
})


app.use('/posts', postRouter)
app.use('/auth', userRouter)
app.use((err, req, res, next) => {
    console.error(err.stack); // optional: log the error
    return res.status(500).json({ message: 'An error occurred!' });
});


// app.listen(3000);

export default app;
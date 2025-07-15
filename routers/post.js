import { Router } from "express";
import commentRouter from './comment.js'
import Post from "../models/posts.model.js";
import Comment from "../models/comments.model.js";
import {isSameUserValidator, isUserValidator} from "../validators/post.validator.js";
import User from "../models/users.model.js";


const router = Router();

router.get('/:postId', async (req, res)=> {
    // const results = posts.filter((item, idx)=> {
        //     return req.params.postId == item.id
        // })
        // use async and await because it's promise type
        
        try {
            const results = await Post.findById(req.params.postId).populate('author', 'username');
            if (!results) {
                return res.status(404).json({error: 'Post not found'});
            }
            res.json(results);
        } catch (err){
            res.status(500).json({message: err.message})
        }
    })
    
router.use('/:postId/comments', commentRouter)

router.get('/', async (req, res)=> {
    try {
        const keyword = req.query.keyword;
        const page = Number(req.query.page);
        const pageSize = Number(req.query.pageSize);

        const skip = (page - 1) * pageSize;
        //let findPosts;

        if(!keyword){
            const total = await Post.countDocuments();
            const findPosts = await Post.find().skip(skip).limit(pageSize)
            return res.json({
                data: findPosts,
                total,
                page,
                pageSize
            })
        }

        const total = await Post.countDocuments({
            $or: [
                    {title: {$regex: keyword, $options: 'i'}},
                    {body: {$regex: keyword, $options: 'i'}}
                ]
        })

        const findPosts = await Post.find({
            $or: [
                    {title: {$regex: keyword, $options: 'i'}},
                    {body: {$regex: keyword, $options: 'i'}}
                ]
        }).skip(skip).limit(pageSize);
        
        // if (keyword){
        //     findPosts = await Post.find({
        //         $or: [
        //             {title: {$regex: keyword, $options: 'i'}},
        //             {body: {$regex: keyword, $options: 'i'}}
        //         ]
        //     });
        // } else {
        //     findPosts = await Post.find();
        // }
        res.json({
            data: findPosts,
            total,
            page,
            pageSize
        });
    } catch (err){
        res.status(500).json({message: err.message});
    }
})

router.post('/', isUserValidator, async (req, res)=> {
    try {
        const {title, body} = req.body;
        const createdPost = await Post.create({
            title,
            body,
            author: req.user._id
        })
        await User.findByIdAndUpdate(req.user._id, {
            $push: {posts: createdPost._id}
        })
        // posts.push(newPost);
        res.status(201).json(createdPost);
    } catch (err){
        res.status(400).json({message: err.message});
    }
})

router.put('/:postId', isSameUserValidator, async (req, res)=> {
    try {
        const postId = req.params.postId;
        const {title, body} = req.body;

        const updatedPost = await Post.findByIdAndUpdate(postId, {
            title,
            body
        }, {
            returnDocument: "after"
        })
        if (!updatedPost) {
            return res.status(404).json({error: 'Post not found'});
        }
        res.json(updatedPost);
    } catch (err){
        res.status(400).json({message: err.message});
    }
})

router.delete("/:postId", isSameUserValidator, async (req, res)=> {
   try {
        const deletedPost = await Post.findByIdAndDelete(req.params.postId);
        // posts = posts.filter((item, idx)=> {
        //     return item.id !== postId;
        // })
        if (!deletedPost){
            return res.status(404).json({error: 'Post not found'});
        }
        
        await User.findByIdAndUpdate(deletedPost.author, {
            $pull: {
                posts: req.params.postId
            }
        })


        //also delete all comments related to this post
        await Comment.deleteMany({post: req.params.postId});

        //success response
        res.status(204).send();
    } catch (err) {
        console.error("Delete post error:", err);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: err.message
        });
    }
})
export default router;
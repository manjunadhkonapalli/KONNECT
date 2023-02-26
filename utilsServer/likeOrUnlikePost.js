const UserModel = require("../models/UserModel");
const PostModel = require("../models/PostModel");

//since we are liking unliking the post through sockets--> so we need to update that data inside notifications array
const {
    newLikeNotification,
    removeLikeNotification
} = require("./notificationActions");


const likeOrUnlikePost = async(postId, userId, like)=>{

    try {
        //Find the post
        const post = await PostModel.findById(postId)

        if(!post){
            return {error: "No post found"}
        }

        //If post has been found ---> And if user wants to like
        if(like){
            //We will check if the user has not already liked the post before
            const isLiked = post.likes.filter(like => like.user.toString()===userId).length>0;

            if(isLiked) return {error : "Post liked before"}

            //If post is not liked before --> add a like now
            await post.likes.unshift({user: userId});

            await post.save();

            //Till now done with liking the post 👆👆👆
            
            //Now update that there is a new like notification in NotificationSchema👇👇👇
            //CHECK => We dont want to sedn notification to ourselves ---> Send notification if user likes posts other than his own posts
            if(post.user.toString() !== userId){    
                await newLikeNotification(userId, postId, post.user.toString());
            }

        }
        //If like is false --> user want to unlike the picture
        else{
            const isLiked = post.likes.filter(like => like.user.toString()===userId).length===0;

            if(isLiked) return {error : "Post not liked before"};

            //If the post has been liked, we tap into likes array, find the index, then remove/splice it
            const indexOf = post.likes.map(like => like.user.toString()).indexOf(userId);

            await post.likes.splice(indexOf, 1);

            await post.save();

            //Remove the like notification
            if(post.user.toString() !== userId){
                await removeLikeNotification(userId, postId, post.user.toString()); //userToNotifyId
            }
        }

        //Look for that user who liked our post
        const user = await UserModel.findById(userId)   //userId = loggedin user who is liking the post

        const {name, profilePicUrl, username} = user;

        return {
            success: true,
            name,
            profilePicUrl,
            username,
            postByUserId: post.user.toString()};    //ID of the user whose post we are liking
        
    } catch (error) {
        return {error : "Server error"}
    }

};


module.exports = {likeOrUnlikePost}
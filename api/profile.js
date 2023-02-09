const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")

const UserModel = require("../models/UserModel")  
const ProfileModel = require("../models/ProfileModel")
const PostModel = require("../models/PostModel")
const FollowerModel = require("../models/FollowerModel") 
const { remove } = require("../models/PostModel")
const bcrypt = require("bcryptjs")

const {newFollowerNotification, removeFollowerNotification} = require("../utilsServer/notificationActions")

//GET PROFILE INFO
router.get("/:username", authMiddleware, async(req, res)=>{

    const {username} = req.params

    try {
        //first search for the user 
        const user = await UserModel.findOne({username:username.toLowerCase()})
        
        //if no user
        if(!user){
            return res.status(404).send("User not found")
        }
        
        //if user exists --> look his profile
        const profile = await ProfileModel.findOne({user:user._id}).populate("user")

        const profileFollowStats = await FollowerModel.findOne({user:user._id})

        return res.json({
            profile,

            followersLength:
            profileFollowStats.followers.length > 0 
            ? profileFollowStats.followers.length : 0 ,

            followingLength:
            profileFollowStats.following.length > 0 
            ? profileFollowStats.following.length : 0
        })


    } catch (error) {
        console.log(error)
        return res.status(500).send("Server error")
    }    

})

//GET ALL POSTS OF USER in profile page
router.get('/posts/:username', authMiddleware, async(req, res)=>{

    const {username} = req.params;

    try {
        //first search for the user 
        const user = await UserModel.findOne({username:username.toLowerCase()})
        
        //if no user
        if(!user){
            return res.status(404).send("User not found")
        }

        //if user is there, check for posts of the user 
        //--> find returns all the posts & findOne returns only 1 post
        const posts = await PostModel.find({user:user._id})
        .sort({createdAt:-1})           //sort based on created date --> -1 denotes to sort in descending order
        .populate("user")
        .populate("comments.user");

        return res.json(posts);

        
        
    } catch (error) {
        console.log(error)
        return res.status(500).send("Server error")
    }


})

//GET FOLLOWERS
router.get("/followers/:userId", authMiddleware, async(req, res)=>{
    const {userId} = req.params

    try {
        //first check whether the user exists ??
        const user = await FollowerModel.findOne({user:userId}).populate("followers.user")

        return res.json(user.followers);

    } catch (error) {
        console.log(error)
        return res.status(500).send("Server error")
    }

})

//GET FOLLOWING
router.get("/following/:userId", authMiddleware, async(req, res)=>{
    const {userId} = req.params

    try {
        //first check whether the user exists ??
        const user = await FollowerModel.findOne({user:userId}).populate("following.user")

        return res.json(user.following);

    } catch (error) {
        console.log(error)
        return res.status(500).send("Server error")
    }

})

//FOLLOWING A USER
router.post("/follow/:userToFollowId", authMiddleware, async(req, res)=>{

    const {userId} = req;       //from middleware
    const {userToFollowId} = req.params

    try {
        //first look for both of the users exist or not
        const user = await FollowerModel.findOne({user:userId})     //loggedin user
        const userToFollow = await FollowerModel.findOne({user:userToFollowId})

        //If none of the users exists
        if(!user || !userToFollow){
            return res.status(404).send('User not found')
        }

        //check if user is already following the userToFollow
        const isFollowing = user.following.length > 0 && user.following.filter(
            following => following.user.toString() === userToFollowId).length > 0;

        //if following previosly
        if(isFollowing){
           return res.status(401).send("Already following the user")
        }

        //if not following prevously -- now follow
        //when we follow someone, their followers count inc, our following count inc
        //first add data inside the following of the user logged in
        await user.following.unshift({user:userToFollowId})       //can also push() 
        await user.save();

        //then add data inside the followers of the user who is being followed
        await userToFollow.followers.unshift({user:userId})
        await userToFollow.save();

        //for following notification to follwed user
        await newFollowerNotification(userId, userToFollowId);

        return res.status(200).send("Following Successful")

    } catch (error) {
        console.log(error)
        return res.status(500).send("Server error")
    }

})


//UNFOLLOW A USER
router.put("/unfollow/:userToUnfollowId", authMiddleware, async(req, res)=>{

    const {userId} = req;       //from middleware
    const {userToUnfollowId} = req.params

    try {
        //first look for both of the users exist or not
        const user = await FollowerModel.findOne({user:userId})     //loggedin user
        const userToUnfollow = await FollowerModel.findOne({user:userToUnfollowId})

        //If none of the users exists
        if(!user || !userToUnfollow){
            return res.status(404).send('User not found')
        }

        //check first whther he followed him previously or not
        const isFollowing = user.following.length>0 &&
            user.following.filter(following=>
            following.user.toString()===userToUnfollowId).length===0;

        //if length == 0 means user has not followed before
        if(isFollowing){
            return res.status(401).send("User not followed previously")
        }

        //Now following count of loggedin user decreases & followers count of who`s being unfollowed also decreases
        //1.now we`re gonna remove the user from following array of the loggedin user &&
        //first get its index --> map thorugh array of followings --> it gets an array of userId`s, Now in that array search for desired id`s index using indexOf()
        const removeFollowing = user.following.map(following=>following.user.toString()).indexOf(userToUnfollowId)
        await user.following.splice(removeFollowing, 1);
        await user.save();

        //2. And from the followers array of whos being unfollowed
        const removeFollower = userToUnfollow.followers.map(follower=>follower.user.toString()).indexOf(userId)
        await userToUnfollow.followers.splice(removeFollower,1);
        await userToUnfollow.save();
        
        //if unfollowed, Remove follow notification from notifications array
        await removeFollowerNotification(userId, userToUnfollowId)

        return res.status(200).send("Unfollowed Successfully")
        
    } catch (error) {
        console.log(error)
        return res.status(500).send("Server error")
    }

})

//UPDATE PROFILE
router.post("/update", authMiddleware, async(req, res)=>{

    try {
        const {userId} = req;       //we get it from auth middleware
        const {bio,facebook,twitter,youtube,linkedin, profilePicUrl} = req.body;

    //------Now Create ProfileModel-------
    let profileFields = {}
    profileFields.user = userId;    //reference this profile model with the user id schema
    profileFields.bio = bio;          //this will create bio field in profileFeilds object and sets value
    profileFields.social = {}       //this will create a socail field which is an object again

    if(facebook)  profileFields.social.facebook = facebook;
    if(youtube)   profileFields.social.youtube = youtube
    if(twitter)   profileFields.social.twitter = twitter
    if(linkedin)   profileFields.social.linkedin = linkedin
    
    await ProfileModel.findOneAndUpdate({user:userId}, {$set:profileFields}, {new:true})
    
    if(profilePicUrl){
        const user = await UserModel.findById(userId);
        user.profilePicUrl = profilePicUrl;
        await user.save()
    }

    return res.status(200).send("Successfully updated!")

    } catch (error) {
        console.log(error)
        return res.status(500).send("Server error")
    }
})


//UPDATE PASSWORD
router.post("/settings/password", authMiddleware, async(req, res)=>{

    try {
        const{userId} = req;        //from authMiddleware
        const {currentPassword, newPassword} = req.body;

        if(newPassword.length<6){
            return res.status(401).send("Password must be atleast 6 characters")
        }
        const user = await UserModel.findById(userId).select("+password")   //Bcz we set select :false

        //check whether the current password is correct or not
        const isPassword = await bcrypt.compare(currentPassword, user.password)
        if(!isPassword){
            return res.status(401).send("Invalid Password");
        }

        //if the password is crt, we save new password into DB
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save()

        return res.status(200).send("Password updated")

    } catch (error) {
        console.log(error)
        return res.status(500).send("Server error")
    }
})

//UPDATE MESSAGE POPUP SETTINGS
router.post("/settings/messagePopup", authMiddleware, async(req, res)=>{

    try {
        
        const user = await UserModel.findById(req.userId)

        if(user.newMessagePopup){
            user.newMessagePopup = false;
        }else{
            user.newMessagePopup = true;
        }
        await user.save();

        return res.status(200).send("Success newMsgPopup")

    } catch (error) {
        console.log(error)
        return res.status(500).send("Server error")
    }

})



module.exports = router;
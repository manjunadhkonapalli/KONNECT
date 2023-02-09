const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware")  //Bcz every route in this file is going to be protected (for those only who loggs in)

const UserModel = require("../models/UserModel")  
const PostModel = require("../models/PostModel")
const FollowerModel = require("../models/FollowerModel")    //we will use this followermodel when we start build Profile page --> Bcz we re going to show posts of the user that he is following
const uuid = require("uuid").v4;
const {
    newLikeNotification,
    removeLikeNotification,
    newCommentNotification,
    removeCommentNotification
} = require("../utilsServer/notificationActions")


//CREATE A POST
router.post("/", authMiddleware, async(req, res)=>{
    
    const {text, location, picUrl} = req.body;

    if(text.length<1)
        return res.status(401).send("Text must be atleast 1 charcater");

    try {
        const newPost = {
            user:req.userId,     //in middleware we set the userId inside our req object --> check authMiddleware.js
            text                //es6 syntax 
        }
        if(location)newPost.location = location;
        if(picUrl)newPost.picUrl = picUrl;

        const post = await new PostModel(newPost).save();
       
        const postCreated = await PostModel.findById(post._id) //so thhat we can take them and render onto front end
        return res.json(post._id);   //since it is populated, its easy to connect to frontend by loking at its structure

    } catch (error) {
        console.log(error);
        return res.status(500).send("Server error");
    }
});


//get request to GET ALL POSTS - get req from home page "/"
router.get("/", authMiddleware, async(req, res)=>{

    const {pageNumber} = req.query;
    const number = Number(pageNumber)   //we will recieve it as string --> convert it to number
    const size = 8;     //every time, a req is made, i want to send 8 posts --> size of posts to send to frontend everytime req is made
    const {userId} = req    //from middleware

    //LECTURE 51
    // try {
    //     let posts;

    //     //chain a limit method to limit the number of elmets to fetch by passing the size varaible
    //     //this case might occur first time fetching the posts
    //     if(number === 1){
    //         posts = await PostModel.find()
    //         .limit(size)                    //limits the number of searches
    //         .sort({createdAt:-1})
    //         .populate("user")
    //         .populate("comments.user")
    //     }
    //     //if pagenumber != 1 --> this case might happen in while scrolling --> just chain skip method
    //     //we need to skip over the posts, which was sent earlier
    //     else{
    //         const skips = size * (number-1)
    //         posts = await PostModel.find()
    //         .skip(skips)                    //skips mentioned number of searches
    //         .limit(size)
    //         .sort({createdAt:-1})
    //         .populate("user")
    //         .populate("comments.user")
    //     }

    //     //return res.json(posts);

    //     //Implementing only see the posts of users we are following
    //     const loggedUser = await FollowerModel.findOne({user:userId})

    //     //if no posts, return empty array
    //     if(posts.length === 0){
    //         return res.json([])
    //     }
    //     //if posts are there,
    //     let postsToBeSent = []

    //     //if logged user is not following anyone, then filter over the posts array -->postsId = userId (logged user) and get all posts posted by logged user --> req.userId means -> loggeduserId
    //     if(loggedUser.following.length===0){
    //         postsToBeSent = posts.filter(post => post.user._id.toString() === userId )
    //     }
    //     //if user if following someone --> forevery user in following array, take his userId, match with userId`s in posts array --> gets posts of following people
    //     //and also match logged userId with posts array too --> gets all self posts of logged user
    //     else{
    //         for(let i=0; i<loggedUser.following.length; i++){
    //            const foundPosts = posts.filter(post => 
    //             post.user._id.toString() === loggedUser.following[i].user.toString() || 
    //             post.user._id.toString() === userId );

    //             if(foundPosts.length>0){
    //                 //we should spreadit. otherwise, it will get stored as array in array
    //                 //postsToBeSent.push(foundPosts);  //non spread ---> [d, e, [a, b, c]]   
    //                 postsToBeSent.push(...foundPosts);  //spread operator --> [d, e, a, b, c] -> foundPosts itself is an array -> so spread it out
    //             }
    //         }
    //     }

    //     return res.json(postsToBeSent)
    // } catch (error) {
    //     console.log(error);
    //     return res.status(500).send("Server error");
    // }

    //LECTURE 52 - Optimized code
    try {   
        const loggedUser = await FollowerModel.findOne({user: userId}).select(
            "-followers"    //we donot need to do anything with the followers data
        );
        

        let posts = [];
        //this case might occur first time fetching the posts
        if(number === 1)
        {
            //if user is following someone -->return all the posts of loggedUser, following users
            if(loggedUser.following.length>0)
            {
                //Basically means find all the posts in PostModel, whose user = userId (loggeduser) self posts &&
                //also find posts of me following users -> to get this, map through the following array --> get ID`s all the users in following array
                //the map returns ID`s of the users whom i am following --> spread it in the array, Bcz map returns array of Ids
                posts = await PostModel.find({
                    user: {
                        $in:[userId, ...loggedUser.following.map(following => following.user)]
                        }
                    })
                    .limit(size)
                    .sort({createdAt: -1})
                    .populate("user")
                    .populate("comments.user");    
            }
            //if not following anyone -> return all the posts of loggedUser
            else{
                posts = await PostModel.find({user: userId})
                    .limit(size)
                    .sort({createdAt: -1})
                    .populate("user")
                    .populate("comments.user"); 
            }
        }
        //if pagenumber != 1 --> this case might happen in while scrolling --> just chain skip method
        else{
            const skips = size * (number-1)

            //if user is following someone -->return all the posts of loggedUser, following users
            if(loggedUser.following.length>0)
            {
                //Basically means find all the posts in PostModel, whose user = userId (loggeduser) self posts &&
                //also find posts of me following users -> to get this, map through the following array --> get ID`s all the users in following array
                //the map returns ID`s of the users whom i am following --> spread it in the array, Bcz map returns array of Ids
                posts = await PostModel.find({
                    user: {
                        $in:[userId, ...loggedUser.following.map(following => following.user)]
                        }
                    })
                    .skip(skips)
                    .limit(size)
                    .sort({createdAt: -1})
                    .populate("user")
                    .populate("comments.user");    
            }
            //if not following anyone -> return all the posts of loggedUser
            else{
                posts = await PostModel.find({user: userId})
                    .skip(skips)
                    .limit(size)
                    .sort({createdAt: -1})
                    .populate("user")
                    .populate("comments.user"); 
            }

        }

        return res.json(posts)
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server error");
    }

});


//get request to GET POST BY ID
//req.params is to be used, bcz the route is based on parameter =  localhost:3000/api/posts/e6fgt63882  --> /:postId  -->  i.e,  whatever will come after 3000/api/posts/ will get caught in postId field(id of post).
// --> localhost:3000/ come from homepage --> /api/posts/ will come from server.js to directory api/posts page --> here e6fgt63882 postId will get added
//this pId or postId or usernameId ---> these are our wish to set :)
//whatever we set --> go and store in req.params as a field
//req.params.postId or req.params.pId or req.params.username
router.get("/:postId", authMiddleware, async(req, res)=>{

    try {
        //tried to solve the Error : Mongoose error Cast to ObjectId failed for value XXX at path "_id"?
        //const postId = ObjectIdfromString(req.params.postId)
 
        //first we will check if there is post or not
        const post = await PostModel.findById(req.params.postId)
            .populate("user")
            .populate("comments.user")

        if(!post){
            return res.status(404).send("Post Not Found");
        }
    //if there is post return it in json formatt
        return res.json(post);

    } catch (error) {
        console.log(error);
        return res.status(500).send("Server error");
    }
})


//dlt request to DELETE POST 
router.delete("/:postId", authMiddleware, async(req, res)=>{

    try {
        
        const {userId} = req;   //Bcz, in authMiddleware, we set userId field into req, object --> check in authMiddleware,js file
        const {postId} = req.params     //above by seeing "/:postId" --> postId field will get set into req.params object

        //first we will check if there is post or not
        const post = await PostModel.findById(postId)
        
        if(!post){
            return res.status(404).send("Post Not Found")
        }

        //check if the user who is deleting this post, is the user who created this post  
        const user = await UserModel.findById(userId);

        //post.user = userid of the user who created the Post --> in PostModel
        //console.log("i am here to delete the post ");
        //console.log("nrml" + post.user);
        //console.log("tostrng" + post.user.toString());
         if(post.user.toString() !== userId){
            if(user.role === "root"){    //root user cna delete anything he wants -- whereas user can dlt only his posts
                await post.remove();
                return res.status(200).send("Post Deleted Successfully By Root User")
            }else{
                return res.status(401).send("Unauthorized Delete");
            }
         }
         //if the user deleting the post himself created the Post --> allow him to dlt 
         await post.remove();
         return res.status(200).send("Post Deleted Successfully By User")

    } catch (error) {
        console.log(error);
        return res.status(500).send("Server error");
    }
})


//LIKE A POST -- req.params  
router.post("/like/:postId", authMiddleware, async(req, res)=>{

    try {
        
        const {userId} = req;        //comes frm authmiddleware
        const {postId} = req.params;     //wet did set postId feild into req.params in above router.get("/likes:postId") line

        //check if the post is avialable
        const post = await PostModel.findById(postId);

        //if no post available
        if(!post){
            //if set 40X --> Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
            return res.status(404).send("No post found")
        }

        //check if the post has already been liked before --> filter over PostModel likes array
        //we are checking this from alreadt retrived data(post). Not from DB --> so not using await        
        const isLiked =  post.likes.filter(like=>like.user.toString()===userId).length > 0;

        //if length > 0 means post is already liked by that user
        if(isLiked){
            return res.status(401).send("Post already liked")
        }

        //if post is not liked --> add a like now
        await post.likes.unshift({user:userId}) //unshift adds an elmt to begginng of the string --> to get recent likes at beggining :)
        await post.save()

        //Sending the notification that post has been liked --> before that check if the loggedin user !== postUser -->bcz if the user likes his own posts, we dont want any notification to ourselves
        if(post.user.toString()!==userId){
            await newLikeNotification(userId, postId, post.user.toString())
        }

        return res.status(200).send("Post Liked")

    } catch (error) {
        console.log(error);
        return res.status(500).send("Server error");
    }
});


//UNLIKE A POST -- req.params  
//why we used put here and post above ??? --> basically post means create, put means update
router.put("/unlike/:postId", authMiddleware, async(req, res)=>{

    try {
        
        const {userId} = req        //comes frm authmiddleware
        const {postId} = req.params     //wet did set postId feild into req.params in above router.get("/likes:postId") line

        //check if the post is avialable
        const post = await PostModel.findById(postId)

        //if no post available
        if(!post){
            //if set 40X --> Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
            return res.status(404).send("No post found");
        }

        //check if the post has already been liked before --> filter over PostModel likes array
        //we are checking this from already retrived data(post). Not from DB --> so not using await
        const isLiked =  post.likes.filter(like=>like.user.toString()===userId).length === 0;

        //if length === 0 means post is not being liked before
        if(isLiked){
            return res.status(401).send("Post not liked before")
        }

        //if post is liked -> map through likes array and get index of that user to delete him from likes array
        const index = post.likes.map(like=>like.user.toString()).indexOf(userId);

        //if post is liked --> unlike it now
        //await post.likes.shift({user:userId}) //through shift we cant delete the desired elmt -only th first one we can
        await post.likes.splice(index, 1);  //splice adds and / or removes elmts at specified index arrray.slice(index-required,   howManyCount-optional    item1, item2..itemx(optional, new elmts if want to add))
        await post.save();

        //when unliked removing the like notification from notifications array --> before that check if the loggedin user !== postUser -->bcz if the user likes his own posts, we dont want any notification to ourselves
        if(post.user.toString()!==userId){
            await removeLikeNotification(userId, postId, post.user.toString())
        }

        return res.status(200).send("Post unliked")


    } catch (error) {
        console.log(error);
        return res.status(500).send("Server error");
    }
})


//get req to -  GET ALL THE LIKES inside the post --> Bcz we will have likes list compnt inside frontend
router.get("/like/:postId", authMiddleware, async(req, res)=>{

    try {
        
        const {postId} = req.params     //wet did set postId feild into req.params in above router.get("/likes:postId") line

        //first we will check if there is post or not
        const post = await PostModel.findById(postId).populate("likes.user");       //populates the PostModel --> Likes --> user 
        if(!post){
            return res.status(404).send("No Post found");
        }

        return res.status(200).json(post.likes);

    } catch (error) {
        console.log(error);
        return res.status(500).send("Server error");
    }
})


//CREATE a COMMENT
router.post("/comment/:postId", authMiddleware, async(req, res)=>{

    try {
        
        const {postId} = req.params;    //wet did set postId feild into req.params in above router.get("/likes:postId") line
        const {text} = req.body;        //This comes from frontend so contains body of the request
        const {userId} = req;           //from our Middleware

        if(text.length < 1){
            return res.status(401).send("Comment should be atleast 1 character");
        }

        //check if any post exists with this postId
        const post = await PostModel.findById(postId);
        //if no post available
        if(!post){
            return res.status(404).send("No Post found");
        }

        //if post exists - store comment now
        const newComment = {
            _id : uuid(),    //Generating unique id with the UUID package.
            text,           //es6 syntax
            user : userId,   //from our Middleware
            date : Date.now()       //gets curent date of commenting
        }   

        //add this comment to commentsArray of the post
        await post.comments.unshift(newComment);    //latest comments to start of the array --> unshift adds elmts to beggining of the array
        await post.save();

        //checking for if we are not commenting on our own post
        if(post.user.toString() !== userId){
            await newCommentNotification(postId, newComment._id, userId, post.user.toString(), text)
        }

        //instead of sending any msg -> we will send commentId back to frontend(from backend). so that we can use it to display the comment on viewport 
        //return res.status(200).send("Comment added");
        return res.status(200).json(newComment._id);

    } catch (error) {
        console.log(error);
        return res.status(500).send("Server error");
    }
})


//DELETE a COMMENT
router.delete("/:postId/:commentId", authMiddleware, async(req, res)=>{

    try {
        
        const {postId, commentId} = req.params; //wet did set postId, commentId feilds into req.params in above router.get("/:postId/:commentId") line - automatically that will get set to :)
        const {userId} = req;   //comes fo authmiddleware
        
        //first we will check if there is post or not
        const post = await PostModel.findById(postId)
        //if no post 
        if(!post){
            return res.status(404).send("No Post found");
        }

        //now check if there is a comment with this commentId
        //we are checking this from alreadt retrived data(post). Not from DB --> so not using await
        const comment = post.comments.find(comment => comment._id === commentId);   //not using .toString() -> bcz _id is of type: String

        //if no comnt found 
        if(!comment){
            return res.status(404).send("No Comment found");
        }
        //But if there is a cmt -> check if (commmented user === user who is trying to dlt it)
        const user = await UserModel.findById(userId);


        async function deleteComment(){
            //map through the comments array and get an array of commentId`s --> then applies indexOf()  on that array gets, actual index
            //if nothing matchs, returns -1
            //splice(negatives) --> removes elmets from end of the array
            const indexOf = post.comments.map(comment => comment._id).indexOf(commentId)
            await post.comments.splice(indexOf, 1);
            await post.save();

            if(post.user.toString()!==userId){
                await removeCommentNotification(postId, commentId, userId, post.user.toString());
            }

            return res.status(200).send("Comment Deleted Successfully");
        }

        if(comment.user.toString()!==userId){
            //check if he is root user --> like youtube owners can dlt their users videos if they found any inconvinience in it
            if(user.role === "root"){
                await deleteComment();
            }else{
                return res.status(401).send("Unauthorized Delete try")
            }
        }

        //if the actual user who made it --> trying to dlt it 
        //repeat the same steps as we did in root user dlt
        await deleteComment();

        res.status(200).send("Comment Deleted Successfully");

    } catch (error) {
        console.log(error);
        return res.status(500).send("Server error");
    }
})

module.exports = router;
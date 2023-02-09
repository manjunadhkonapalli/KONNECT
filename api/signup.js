const express = require("express");
const router = express.Router();    //used to create new Router object in our program to handle requestss

const UserModel = require("../models/UserModel"); //require our models
const ProfileModel = require("../models/ProfileModel");
const FollowerModel = require("../models/FollowerModel");
const NotificationModel = require("../models/NotificationModel")
const ChatModel = require("../models/ChatModel")

const jwt = require("jsonwebtoken");  //jwt to send back the token - used to securely transfer information over the web(between) two parties.
const bcrypt = require("bcryptjs");   //to encrypt the passwords 
const isEmail = require("validator/lib/isEmail");   //from our validator package, we are going to validate is the emails are in right format or not

const userPng =
  "https://res.cloudinary.com/indersingh/image/upload/v1593464618/App/user_mklcpl.png";   //if user doesnt provide the img, this is the default one we use

const regexUserName = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;

//just like app.get() --> to check whether the username is available or not
router.get("/:username", async(req, res) => {
  
  //diff btwn req.body & req.params
    //req.body = Generally used in POST/PUT requests --> Use it when we want to send sensitive data(eg. form data) to the server.
    //req.params = These are properties attached to the url i.e named route parameters -> /:username => localhost:3000/manjunadh554
  const { username } = req.params;  //receive it under parameter field in request object

  console.log(req.params);

  try{
    if(username.length<1)
      return res.status(401).send("Invalid")
    
    //we check in backend for the valid reqular expression - every regex has test method, it if passes method, return true
    if(!regexUserName.test(username))
      return res.status(401).send("Invalid")

    //We check in the DB, if there is any other user with that username
    const user =  await UserModel.findOne({username:username.toLowerCase()});
    console.log(user)

    if(user)  return res.status(401).send("Username already taken")
    return res.status(200).send("Available");

  }catch(error){
    console.log(error)
    return res.status(500).send("Server error in get");
  }    
  
});

//Post request from the client side for creating a new user
router.post("/", async(req, res)=>{
  //we are gonna receiver the user state through (req.body)
  //Destructuring the object that we get
  const {
    name, 
    email, 
    password,
    username,
    bio,
    facebook,
    twitter,
    youtube,
    linkedin

  } = req.body.user;

  if(!isEmail(email))
    return res.status(401).send("Invalid Email");

  if(password.length < 6)
    return res.status(401).send("Password must be atleast 6 characters")

  try{
    //First we will find the user, if there is any user with this email --> means already registered
    let user;
    user = await UserModel.findOne({email: email.toLowerCase() })   //we convert all to lowerase and store. so we will search in same manner.
  
    if(user)
      return res.status(401).send("User already registered")
    
    //If user is new, create a new model then save user into DB
    //new mongoose.model
    user = new UserModel({
      name : name,
      email : email.toLowerCase(),
      password : password,
      username : username.toLowerCase(),
      profilePicUrl : req.body.profilePicUrl || userPng   //After we upload images to cloudinary, we store this profilePic url in DB if user provides it or we simply use userPng(default pic)
    });

    //salting & hashing password with bcrypt --> paswrd + salt = hash
    user.password = await bcrypt.hash(password, 10)   //10 = number of salt rounds
    await user.save();

    //------Now Create ProfileModel-------
    let profileFields = {}
    profileFields.user = user._id;    //reference this profile model with the user id schema
    profileFields.bio = bio;          //this will create bio field in profileFeilds object and sets value
    profileFields.social = {}       //this will create a socail field which is an object again

    if(facebook)  profileFields.social.facebook = facebook;
    if(youtube)   profileFields.social.youtube = youtube
    if(twitter)   profileFields.social.twitter = twitter
    if(linkedin)   profileFields.social.linkedin = linkedin

    await new ProfileModel(profileFields).save();
    await new FollowerModel({user: user._id, followers: [], following: []}).save()
    await new NotificationModel({user:user._id, notifications:[]}).save(); //while signingup we have to create the instances of these models
    await new ChatModel({user:user._id, chats:[]}).save()   //created after creating the ChatModel

    //if the user successfully registered, we`re gonna send back the token to the client side (probably the user _id to fetch the whole user related data)
    //Something relatede to tokens
    const payload = {userId : user.id};
    jwt.sign(payload, process.env.jwtSecret, {expiresIn: "2d"}, (err, token)=>{
      if(err) throw err;
      res.status(200).json(token);  //the token is of json type. so instead of .send we are using .json
    });


  }catch(error){
    console.log(error);
    return res.status(500).send("Server Error in post");
  }

});

module.exports = router;

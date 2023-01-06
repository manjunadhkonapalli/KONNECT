const express = require("express");
const router = express.Router();

const UserModel = require("../models/UserModel");
const FollowerModel = require("../models/FollowerModel");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const isEmail = require("validator/lib/isEmail");

const authMiddleware = require("../middleware/authMiddleware")


//get request to send the user details onto homepage initially 
//we are adding this here but not in api/signup whyy ?? ---> Bcz, in signup, use is newly registering, so he just we need to save the user details then ask hin to login
//after login (api/auth.js) only thw homepage and initial data on it will appear too
router.get("/", authMiddleware, async(req, res)=>{

  //console.log(req)
  const {userId} = req;   //in authMiddleware file, we have req obj, userId field in it

  try {
    //First get the user
    const user = await UserModel.findById(userId)

    //also maintain users, following, followers information --> this is to be represented on Homepage
    const userFollowStats = await FollowerModel.findOne({user:userId})
    
    return res.status(200).json({user, userFollowStats})  //send/return this whole data related to user, userFollowStats so we can destructure it when needed


  } catch (error) {
      console.log(error);
      return  res.status(500).send("Server Error");
  }

})



router.post("/", async (req, res) => {
  const { email, password } = req.body.user;

  if (!isEmail(email)) return res.status(401).send("Invalid Email");

  if (password.length < 6) {
    return res.status(401).send("Password must be atleast 6 characters");
  }

  try {
    //Get the password of the user with the given email
    const user = await UserModel.findOne({email: email.toLowerCase()}).select("+password")  //chain a method

    if (!user) {
      return res.status(401).send("Invalid Credentials");
    }

    //takes the password, performs hashing, salting on it and the keep comparing with the hash present in the DB in password field - if mathches return true
    const isPassword = await bcrypt.compare(password, user.password); //(string, hash)
    
    if (!isPassword) {
      return res.status(401).send("Invalid Credentials");
    }

    //if the password is correct, we`re gonna send back the token with this jwt token
    const payload = { userId: user._id };
    jwt.sign(payload, process.env.jwtSecret, { expiresIn: "2d" }, (err, token) => {
      if (err) throw err;
      res.status(200).json(token);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Server error`);
  }
});

module.exports = router;

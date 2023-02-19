const express = require("express");
const router = express.Router()
const UserModel = require("../models/UserModel")
const bcrypt = require("bcryptjs")
const nodemailer = require("nodemailer");   //package used to send email from Node.js applications
const sendGridTransport = require("nodemailer-sendgrid-transport");
const crypto = require("crypto")    //We need it to generate the token
const isEmail = require("validator/lib/isEmail")    //To check if email is valid
const baseUrl  = require("../utils/baseUrl")

const options = {
    auth: {
        api_key: process.env.sendGrid_api
    }
}

//Initialize it
const transporter = nodemailer.createTransport(sendGridTransport(options));


//CHECK USER EXISTS and SEND EMAIl FOR RESET PASSWORD
router.post("/", async(req, res)=>{

    try {
        const {email} = req.body;

        if(!isEmail(email)){
            return res.status(401).send("Invalid Email")
        }

        //If email is valid Check for the User with this email
        const user = await UserModel.findOne({email:email.toLowerCase()})
        
        if(!user){
            return res.status(404).send("User not found")        
        }

        //If user is there ---> generate token
        const token = crypto.randomBytes(32).toString("hex");   //Generates 32 bit numb --> convert it to string of hex type

        user.resetToken = token;
        //The token will be valid till 1hr from when it is generates
        user.expireToken = Date.now() + 3600000;     //1hr -> Its in milliseconds

        console.log("5 ErrorHERE")
        await user.save();
        console.log("6 ErrorHere")

        const href = `${baseUrl}/reset/${token}`;

        //Send the email to the user
        const mailOptions = {
            to: user.email,
            from: "manjunadhkonapalli5@gmail.com",
            subject: 'Hi there! Password reset request',
            html: `<p>Hey ${
                user.name.split(" ")[0].toString()},
                There was a request for password reset. <a href=${href}>Click this link to reset the password </a> </p>
                <p>This token is valid only for 1 hour.</p>`
        };

        transporter.sendMail(mailOptions, (err, info)=>err && console.log(err));

        return res.status(200).send("Email sent successfully")

    } catch (error) {
        console.error(error)
        return res.status(500).send('Server Error22')
    }
});


//VERIFY THE TOKEN and RESET THE PASSWORD IN DB
router.post("/token", async(req, res)=>{

    try {
        //First get the token from body
        const {token, password} = req.body

        if(!token){
            return res.status(401).send("Unauthorized");
        }

        if(password.length < 6) return res.status(401).send("Password must be atleast 6 characters!")

        //Now look for the user with this token ---> that is generated and stored in above part of code
        //user.resetToken = token;  user.expireToken = Date.now() + 3600000
        const user = await UserModel.findOne({resetToken: token})

        //If User not found with that token
        if(!user){
            return res.status(404).send("User not found");
        }

        //If User is there --> now we will check if token is not expired
        if(Date.now() > user.expireToken){
            return res.status(401).send("Token expired.Generate new one")
        }

        //If Everything is fine --> save the new password
        user.password = await bcrypt.hash(password, 10);

        //Once password is set --> remove the reset token so that no other can access and change the password again wihtin 1hour
        user.resetToken = "";
        user.expireToken = undefined;

        await user.save()

        return res.status(200).send("Password updated successfully!")
        
    } catch (error) {
        console.error(error)
        return res.status(500).send('Server Error')
    }
})



module.exports = router;
const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const UserModel = require("../models/UserModel")

//we will make Get request from the frontend
//localhost:3000/home/sriram  -->  localhost:3000/home/?q=sriram
router.get("/:searchText",authMiddleware, async(req, res)=>{

    //diff btwn req.body & req.params
    //req.body = Generally used in POST/PUT requests --> Use it when we want to send sensitive data(eg. form data) to the server.
    //req.params = These are properties attached to the url i.e named route parameters -> /:username => localhost:3000/manjunadh554
    const {searchText} = req.params
    const {userId} = req

    if(searchText.length===0)return;

    try {
        //getting bugs -- so removed it
        //let userPattern = new RegExp(`^${searchText}`)  //this will get converted into a regular expression
        
        const results = await UserModel.find({
            name:{$regex:searchText, $options:"i"}     //DOUBT : means that this will not be case sensitive
        });

        //filtering the results so that we dont get our own profile/chat --> like manju searching manju in his linkeid Search page
        const resultsToBeSent = results.length>0 && results.filter(result=>result._id.toString() !== userId)

        return res.status(200).json(resultsToBeSent);

    } catch (error) {
        console.log(error);
        return res.status(500).send("Server error");
    }

})





module.exports = router
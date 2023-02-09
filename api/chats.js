const express = require("express")
const router = express.Router()
const ChatModel = require("../models/ChatModel")
const UserModel = require("../models/UserModel")
const authMiddleware = require("../middleware/authMiddleware")


//GET ALL CHATS
router.get("/", authMiddleware, async(req, res)=>{

    try {
        //Destructure our userId from middleware
        const {userId} = req;

        //loook for user 
        const user = await ChatModel.findOne({user:userId}).populate("chats.messagesWith")  //populates the other side use of chats

        //we only need the most recent message - run a map loop here
        let chatsToBeSent = []

        if(user.chats.length > 0){
            chatsToBeSent = await user.chats.map(chat => ({
                messagesWith : chat.messagesWith._id,
                name : chat.messagesWith.name,
                profilePicUrl : chat.messagesWith.profilePicUrl,
                lastMessage : chat.messages[chat.messages.length - 1].msg,     //this gets the latest/recent message stored at the last index of the array
                data : chat.messages[chat.messages.length - 1].date
            }))
        }
        
        return res.json(chatsToBeSent)
        
    } catch (error) {
        console.error(error)
        return res.status(500).send("Server Error")
    }

});

//GET USER INFO
router.get(`/user/:userToFindId`, authMiddleware, async(req, res)=>{

    try {
        //look for the user
        const user = await UserModel.findById(req.params.userToFindId)

        if(!user){
            return res.status(404).send("No User found")
        }

        return res.json({name: user.name, profilePicUrl: user.profilePicUrl});
        
    } catch (error) {
        console.error(error)
        return res.status(500).send("Server Error")
    }

})


module.exports = router
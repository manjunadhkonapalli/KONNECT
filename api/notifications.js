const express = require("express");
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const UserModel = require("../models/UserModel")
const NotificationModel = require("../models/NotificationModel")

router.get("/", authMiddleware, async(req, res)=>{

    try {
        //Destructure out the userId from middleware
        const {userId} = req;

        //Now look for the user in notification model whether the notifications exists with userId or not
        const user = await NotificationModel.findOne({user:userId})
            .populate("notifications.user")
            .populate("notifications.post") 
        
            return res.json(user.notifications);

    } catch (error) {
        console.error(error)
        return res.status(500).send("Server Error")
    }

})

//Post req from homeroute
//when the user is in notifications page, we set the unreadNotifications to false. so that icon changes inside the side menu automatically 
router.post("/", authMiddleware, async(req, res)=>{

    try {
        //Destructure out the userId from middleware
        const {userId} = req;

        //Now look for the user in User model
        const user = await UserModel.findById(userId)
        
        if(user.unreadNotification){
            user.unreadNotification = false;
            await user.save()
        }

        return res.status(200).send("Updated");
    } catch (error) {
        console.error(error)
        return res.status(500).send("Server Error")
    }

})





module.exports = router
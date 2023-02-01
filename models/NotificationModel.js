const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    //Whose model is this --->loggedUser(userId) -- later this tells whoevever the cause for notification in NotificationModel of others
    user : {type:Schema.Types.ObjectId, ref:"User"},

    //notifications will be an arrray -> enums means, in overall we are going to have 3 types of notifications
    notifications : [
        {
            type : {type:String, enum:["newLike", "newComment", "newFollower"]},    //types of notification
            
            user : {type:Schema.Types.ObjectId, ref:"User"},     //The user from whom this notification is..
            
            post : {type: Schema.Types.ObjectId, ref:"Post" },  //id of the post on which new like or comment is there 
            
            commentId : {type: String},     //id of the comment which is created on the post
            
            text : {type: String},  //we will show text of the comment inside the notification
            
            date : {type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model("Notification", NotificationSchema)
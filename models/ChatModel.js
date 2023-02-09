const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const ChatSchema = new Schema({

    user : {type:Schema.Types.ObjectId, ref:"User"},     //Whose model this is

    //array of all the chats of this user
    chats : 
    [
        {
            messagesWith : {type:Schema.Types.ObjectId, ref:"User"},   //With whom this conversation/ chat is ..

            messages : 
            [
                {
                    msg : { type : String, required : true },
                    sender : {type: Schema.Types.ObjectId, ref:"User"},     //If we send msg to someone, sender = loggedUser. If we receive msg sender = anotherUser
                    receiver : {type:Schema.Types.ObjectId, ref:"User"},
                    date : {type : Date}

                }
            ]
        }   
    ]      

})


module.exports = mongoose.model('Chat', ChatSchema)
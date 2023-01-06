const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    user : {type:Schema.Types.ObjectId, ref:"User"},
    
    text :{type: String, required:true},
    
    location : {type:String},

    picUrl : {type:String},

    //with below structure we can populate the data if we want o
    likes : [
        {
           user : {type:Schema.Types.ObjectId, ref:"User"} 
        }
    ],

    comments : [
        {
            _id : {type:String, required:true},   
            user : {type:Schema.Types.ObjectId, ref:"User"},
            text : {type:String, required:true},
            date : {type:Date, default:Date.now}    //user doesnt provoide the date with comment -> so every time make default date of now (current time of commenting)
        }
    ]
    
}, {timestamps:true})   //to know when this post is created


module.exports = mongoose.model("Post", PostSchema);


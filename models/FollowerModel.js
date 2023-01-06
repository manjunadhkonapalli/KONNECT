const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Link this schema also with user schema
const FollowerSchema = new Schema({
    user :{type:Schema.Types.ObjectId, ref:"User"},

    //followers, following are an array of users
    followers : [
        {
        user :{type:Schema.Types.ObjectId, ref:"User"}
        }
    ],

    following : [
        {
        user :{type:Schema.Types.ObjectId, ref:"User"}
        }
    ]

})

module.exports = new mongoose.model("Follower", FollowerSchema)

//module.exports = Follower
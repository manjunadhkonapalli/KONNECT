const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Link this profile model to user model  ---> By default MongoDB creates _id field --> set below user with that id
const ProfileSchema = new Schema({
    user : {type: Schema.Types.ObjectId, ref:"User"},    //ref should match to the schema name to which we are linking to..

    bio : {type:String, required:true},

    social : {
        facebook : {type:String},
        youtube : {type:String},
        linkedin : {type:String},
        twitter : {type:String},
    }

}, {timestamps:true});

module.exports = mongoose.model("Profile", ProfileSchema)

//module.exports = Profile
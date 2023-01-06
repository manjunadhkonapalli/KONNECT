const mongoose = require("mongoose");
const Schema = mongoose.Schema

//By default mongoDB creates _id field
const UserSchema = new Schema({
    name : {type:String, required:true},

    email : {type:String, required:true, unique:true},   //we dont want same email in our database

    //The advantage of doing it this way is we won't be sending password to the frontend when we make a GET request on api/auth.js
    //Then we can pull it in as needed in find and populate calls via field selection as "+password"
    //EX : Users.findOne({_id: id}).select('+password')
    //
    password : {type:String, required:true, select:false},   //select att protects the password field in mongoose/MongoDB to appear as it is(for security purpose)--> this field is not going tobe shown by default

    username : {type:String, required:true, unique:true, trim:true}, //any spaces will automatically be trimmed

    profilePicUrl : {type:String},

    newMessagePopup : {type:Boolean, default:true},  //These booleans are used to make layout changes in our front end

    unreadMessage : {type:Boolean,default:false},

    unreadNotification : {type:Boolean,default:false},

    role : {type:String, default:"user", enum:["user", "root"]},    //enum basically tells that there are only 2 values for this field, (only inside values, not any other values than that)

    resetToken :{Type:String},  //token that we send to user to reset their password

    expireToken :{Type:Date},   //we check an expiration time (1hr) for this token

}, {timestamps: true}       //on the second argument of the schema, set timestamps to true so that we can know when the user was created
);

//Create a model based on above schema. ---> Schema(template) -> Model(empty table name) -->actual table with data in it
//name of the schema = User , use UserSchema blueprint / template to create this schema
module.exports = mongoose.model("User", UserSchema)

//Export the model(non react version or JavaScript version)
//module.exports = User;
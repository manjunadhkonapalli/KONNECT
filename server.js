//Creating out custom server instead of Next.js server
//Great thing about Next.js is that, both server and app will run on same 3000 port. no need to run 2 ports side by side 

//const webpack = require('webpack');
const express = require("express")
const app = express();
const server = require("http").Server(app)
const io = require("socket.io")(server);
const next = require("next");

const dev = process.env.NODE_ENV !== "production"
const nextApp = next({dev})     //nextApp tells whether the app is in development or production mode
const handle = nextApp.getRequestHandler();
require("dotenv").config({path : "./config.env"})   //require the .env package
const connectDb = require("./utilsServer/connectDb")
const PORT = process.env.PORT || 3000;  //when app is deployed to heroku, it automatically provides teh port inside the environment variables.
app.use(express.json());    //add bodyparser
connectDb() //calling our connectDb func which is stores as a separate file
const {addUser, removeUser} = require("./utilsServer/roomActions")
const {loadMessages, sendMsg}  = require("./utilsServer/messageActions")


//'connection' is a default event from socket.io - we should not use it ourself
//socket - client who is connected
//inside this func we will have all the events  -  we will receive the data here inside
//method(event_name, callback) -  eventname can be anything that should match at both client & server side
io.on("connection", socket => {
    // socket.on('helloWorld', ({name, age})=>{
    //     console.log({name, age});

    //     socket.emit("dataReceived", {msg: `Hello ${name}, data received`});
    // });

    socket.on("join", async ({userId})=>{
        const users = await addUser(userId, socket.id);

        console.log(users);

        //after 10 sec send back data to client - refreshing the users so that we maintain the lastest data
        setInterval(()=>{
            //After adding newUser, sending back all the users other than the loggeduser who made this connection
            socket.emit("connectedUsers", {users:users.filter(user => user.userId !== userId)})
        }, 10000)   
    });

    socket.on('loadMessages', async({userId, messagesWith})=>{
        const {chat, error} = await loadMessages(userId, messagesWith)

        //if no error return chat from here to client
        if(!error){
            socket.emit("messagesLoaded", {chat})
        }
    })

    //SEND messages from chatbox
    socket.on("sendNewMsg", async({userId, msgSendToUserId, msg})=>{

        //call the function or make req to backend to store the msgs in DATABASE
        const {newMsg, error} = await sendMsg(userId, msgSendToUserId, msg)

        if(!error){
            socket.emit("msgSent", {newMsg})    //confirmation that msg is sent & send back the newMsg
        }
        else{
            socket.emit("noChatFound")
        }
    })

    //socket.disconnect()
    socket.on("disconnect",()=>{
        removeUser(socket.id)
        console.log("User disconnected")
    })
    

})


//.prepare() --> it prepares or makes the next.js code ready to use another server (express) for handling SSR
nextApp.prepare().then(function(){

    app.use("/api/signup", require("./api/signup"));
    app.use("/api/auth", require("./api/auth"));
    app.use("/api/search", require("./api/search"));
    app.use("/api/posts", require("./api/posts"));
    app.use("/api/profile", require("./api/profile"))
    app.use("/api/notifications", require("./api/notifications"))
    app.use("/api/chats", require("./api/chats"))

    //app.all --> all the pages in Next.js are SSR(server side rendered).So if we dont write app.all, the files inside the pages folder wont work.
    app.all("*", function (req, res){
        handle(req, res)
    });

    //listen to server
    server.listen(PORT, function(err){
        if(err)
            throw err;
        console.log("Express server running");
    })
});
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
const {addUser, removeUser,findConnectedUser} = require("./utilsServer/roomActions")
const {loadMessages, sendMsg, setMsgtoUnread, deleteMsg}  = require("./utilsServer/messageActions")
const {likeOrUnlikePost} = require("./utilsServer/likeOrUnlikePost")

//'connection' is a default event from socket.io - we should not use it ourself
//socket - client who is connected
//inside this func we will have all the events  -  we will receive the data here inside
//method(event_name, callback) -  eventname can be anything that should match at both client & server side
io.on("connection", socket => {
    /* socket.on('helloWorld', ({name, age})=>{
         console.log({name, age});

         socket.emit("dataReceived", {msg: `Hello ${name}, data received`});
     }); */

    //Here in async func, we are catching userIdin object form Bcz, in emit func, we are sending them in object format only
    socket.on("join", async ({userId})=>{
        const users = await addUser(userId, socket.id);

        //console.log(users);

        //after 10 sec send back data to client - refreshing the users so that we maintain the lastest data
        setInterval(()=>{
            //After adding newUser, sending back all the users other than the loggeduser who made this connection
            socket.emit("connectedUsers", {users:users.filter(user => user.userId !== userId)})
        }, 10000)   
    });

    //Socket request to like the post
    socket.on("likePost", async({postId, userId, like})=>{
        const{
            success,
            name,
            profilePicUrl,
            username,
            postByUserId,
            error
        } = await likeOrUnlikePost(postId, userId, like);

        if(success){
            socket.emit("postLiked");

            //If we have liked our own post, we are not going to send a notification to ourselves
            if(postByUserId !== userId){
                //First we will check if the user whom we want to emit notification, is online ?? --> the server will check if we are online then only we will get realtime notification
                const receiverSocket = findConnectedUser(postByUserId)
            
                //If there is user online, and need to like -->only emit notification when we like the post, no notification for unlike
                if(receiverSocket && like){
                    //Emit an event to 1 particular user(reciverSocket)
                    io.to(receiverSocket.socketId).emit("newNotificationReceived", {name, profilePicUrl, username, postId})
                
                }

            }
        }
    });


    socket.on('loadMessages', async({userId, messagesWith})=>{
        const {chat, error} = await loadMessages(userId, messagesWith)

        //if no error return chat from here to client
        if(!error){
            socket.emit("messagesLoaded", {chat})
        }
        //If not chat found with that user --> show empty chat area
        else{
            socket.emit("noChatFound")
        }
    })

    //SEND messages from chatbox
    socket.on("sendNewMsg", async({userId, msgSendToUserId, msg})=>{

        //call the function or make req to backend to store the msgs in DATABASE
        const {newMsg, error} = await sendMsg(userId, msgSendToUserId, msg)

        //Find if receiver is online or not, by checking in users array in roomActions
        const receiverSocket = findConnectedUser(msgSendToUserId)

        //If user exists in users array --> is online --> gte socketId of receiver to send him msg 
        if(receiverSocket){
            io.to(receiverSocket.socketId).emit("newMsgReceived", {newMsg}) //WHEN WE WANT TO SEDN MSG TO A PARTICULAR SOCKET
        }
        //If receiver socket is not there --> user is offine --> set his unreadMessage field to true
        else{
            await setMsgtoUnread(msgSendToUserId);
        }

        if(!error){
            socket.emit("msgSent", {newMsg})    //confirmation that msg is sent & send back the newMsg
        }
    })

    //to delete Msg
    socket.on("deleteMsg", async({userId, messagesWith, messageId})=>{

       const {success} = await deleteMsg(userId, messagesWith, messageId)
       if(success){
        socket.emit("msgDeleted");
       }

    });

    //Send MSG through MODAL
    socket.on("sendMsgFromNotification", async({userId, msgSendToUserId, msg})=>{

//CONTENT copied from above "sendNewMsg" event listener
//To differentiate if any error occured from sending msg either from chat area or from MsgModal we created 2 different event listeners
//The socket.emit in if(!error) case differentiates both type of sending messages

        //call the function or make req to backend to store the msgs in DATABASE
        const {newMsg, error} = await sendMsg(userId, msgSendToUserId, msg)

        //Find if receiver is online or not, by checking in users array in roomActions
        const receiverSocket = findConnectedUser(msgSendToUserId)

        //If user exists in users array --> is online --> gte socketId of receiver to send him msg 
        if(receiverSocket){
            io.to(receiverSocket.socketId).emit("newMsgReceived", {newMsg}) //WHEN WE WANT TO SEDN MSG TO A PARTICULAR SOCKET
        }
        //If receiver socket is not there --> user is offine --> set his unreadMessage field to true
        else{
            await setMsgtoUnread(msgSendToUserId);
        }

        //This is just a confirmation that msg has been sent
        if(!error){
            socket.emit("msgSentFromNotification")
        }

    })

//----BAD, will throw an error-----
    // //socket.disconnect().on()
    // socket.on("disconnect",()=>{
    //     removeUser(socket.id)
    //     console.log("User disconnected")
    // })
    

})


//.prepare() --> it prepares or makes the next.js code ready to use another server (express) for handling SSR
nextApp.prepare().then(function(){

    app.use("/api/signup", require("./api/signup"));
    app.use("/api/auth", require("./api/auth"));
    app.use("/api/search", require("./api/search"));
    app.use("/api/posts", require("./api/posts"));
    app.use("/api/profile", require("./api/profile"))
    app.use("/api/notifications", require("./api/notifications"))
    app.use("/api/chats", require("./api/chats"));
    app.use("/api/reset", require("./api/reset"))

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
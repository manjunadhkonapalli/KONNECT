//Creating out custom server instead of Next.js server

//const webpack = require('webpack');
const express = require("express")
const app = express();
const server = require("http").Server(app)
const next = require("next");

const dev = process.env.NODE_ENV !== "production"
const nextApp = next({dev})     //nextApp tells whether the app is in development or production mode
const handle = nextApp.getRequestHandler();

//require the .env package
require("dotenv").config({path : "./config.env"})

const connectDb = require("./utilsServer/connectDb")

//when app is deployed to heroku, it automatically provides teh port inside the environment variables.
const PORT = process.env.PORT || 3000;

//add bodyparser
app.use(express.json());

//calling our connectDb func which is stores as a separate file
connectDb()

//Great thing about Next.js is that, both server and app will run on same 3000 port. no need to run 2 ports side by side 

//.prepare() --> it prepares or makes the next.js code reasy to use another server (express) for handling SSR
nextApp.prepare().then(function(){

    app.use("/api/signup", require("./api/signup"));
    app.use("/api/auth", require("./api/auth"));
    app.use("/api/search", require("./api/search"));
    app.use("/api/posts", require("./api/posts"));

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
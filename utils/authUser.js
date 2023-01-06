import axios from "axios"
import baseUrl from "./baseUrl"
import catchErrors from "./catchErrors"
import Router from "next/router"        //just like res.render() in prev projects we use this
import cookie from "js-cookie"


export async function registerUser(user, profilePicUrl, setError, setFormLoading){
   // setFormLoading(true) ---> bcz already setting to true in handleSubmit func
    try {
        //post request to server
        const res = await axios.post(`${baseUrl}/api/signup`, {user, profilePicUrl})

        //after this req is made, we`ll send a token from our backend
        setToken(res.data)  //inside the data we`re sending the token --> res.status(401).send("token") kind of..



    } catch (error) {
        const errorMsg = catchErrors(error)  //this func is basically to extract error msg from err object
        setErrorMsg(errorMsg)
    }
    setFormLoading(false)
}

export async function LoginUser(user, setErrorMsg, setFormLoading){
    setFormLoading(true)
    try {
        //post request to server
        const res = await axios.post(`${baseUrl}/api/auth`, {user})     //by passing the user as body

        //after this req is made, we`ll send a token from our backend
        setToken(res.data)  //inside the data we`re sending the token --> res.status(401).send("token") kind of..



    } catch (error) {
        const errorMsg = catchErrors(error)  //this func is basically to extract error msg from err object
        setErrorMsg(errorMsg)
    }
    setFormLoading(false)
}

//location -> strings to which we are going to redirect our user to ...
export function redirectUser(ctx, location){    

    //HTTP req property in ctx - noted dow in udemy notes also
    if(ctx.req){    //if user is on server side - Bcz we only have value for req field when we are on server side
        ctx.res.writeHead(302, {Location:location})     //the resource requested, has been temporarily moved to(new location) the URL given by the Location header
        ctx.res.end();
    }else{      //if user is on client side
        Router.push(location)
    }

}

function setToken(token){
    //use our js cookie package to send token in form of browser cookies :)
    cookie.set("token", token); //name : value

    Router.push("/")//after this cookie is set, we push the user to homepage
}

export function logoutUser(email){
    cookie.set("userEmail", email)      //after logging out now and logging in later, email field is automatically field Bcz of this email token :) Just password is tobe entered
    cookie.remove("token");             //remove the token, so that authetication, cookie will gets deleted from browser

    Router.push("/login")               //redirect the user to login page
}
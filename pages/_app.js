import App from "next/app";     //Import the default App component to get all default features, functionalities of pages.
import Layout from "../components/Layout/Layout";   //its a default export. so dont use 
import "semantic-ui-css/semantic.min.css"
import axios from "axios";
import {parseCookies, destroyCookie} from "nookies"
import baseUrl from "../utils/baseUrl"
import {redirectUser} from "../utils/authUser"
import 'react-toastify/dist/ReactToastify.css';
import "cropperjs/dist/cropper.css"


//
//The component prop is the active page. whenver we navigate between routes, component will change to the new page
// EX: whenevr we are on login or signup pages, then the component will be login or signup
// function MyApp({Component, pageProps}){
//     return <Component {...pageProps} />      //Spread operator
// }

// class MyApp extends App{

//     //appContext, ctx are different --> ctx is a property inside appContext
// static async getInitialProps({Component, ctx}){     //destructure appContext here only

//     //const {Component, ctx} = appContext   //component is just an active page
//     //console.log(appContext)
//     //

//     const {token} = parseCookies(ctx)    //first we check whether there is a token or not -- pass ctx then it will automatically parse over cookie

//     let pageProps ={};

//     //ctx pathname is nothing but the route to which user is to be redirected
//     const protectedRoutes = ctx.pathname==="/"

//     //if there is no token --> user is not loggedin -> and if user is trying to access protected Routes(homepage) -> then we will redirect the user ti login page
//     if(!token){
//         protectedRoutes && redirectUser(ctx, "/login")
//     }else{
//         //if token is there -> user loggedin--> wait for getInitialProps  to load
//         if(Component.getInitialProps){   //if any componnet(an active page) is requesting getInitial props we gonna set it to pageProps
//             pageProps = await Component.getInitialProps(ctx)
//         }        

//         //then, we make get request to the backend to get user information who was loggedin
//         try {
//             const res = await axios.get(`${baseUrl}/api/auth`, {headers: {Authorization:token}})
            
//             //As we seen in Postman we will receive an object user, userFollowStats after succesfull authorization
//             const {user, userFollowStats} = res.data

//             //if there is any user(user exists) -> and user is accesing routes other than protectdRoutes(homepage) like login, signup --> we`re not gonna allow it, bcz user is already loggedin -> so redirect to homepage automatically (even if /login, /signup)
//             if(user)    !protectedRoutes && redirectUser(ctx, "/")

//             //set user, userFollowStats properties in pageProps --> initialProps
//             pageProps.user = user;
//             pageProps.userFollowStats = userFollowStats


//         } catch (error) {       //if there is any error, destroy the cookie and redirect the user tpo login page
//             destroyCookie(ctx, "token")
//             redirectUser(ctx, "/login")
//         }


//     }

//     //so after returning pageProps, it will automaticlly get added to the props of MyApp class
//     return {pageProps}   //getInitiaProps always resolves to an object

// }

// //we can use pageProps here inside (anywhere)
//     render(){
//         const {Component, pageProps} = this.props    
        
//         return (
//             <Layout {...pageProps}>                {/*Spreading the pageProps --> we are going to receive all the properties, in all the pages*/}
//                 <Component {...pageProps} />    {/*if we are not spreading it out, we would have to pass posts like this posts:{pageProps.posts} since we want posts to be rendered - spread posts separetly */}
//             </Layout>
//         );
//     }
// }


// ------ Refactoring above class based component -> Fuctional based component --> So no need to extend App --> so no need to import it from next/app
function MyApp({Component, pageProps}){

    return (        //layouts children is component
        <Layout {...pageProps}>                {/*Spreading the pageProps --> we are going to receive all the properties, in all the pages*/}
            <Component {...pageProps} />    {/*if we are not spreading it out, we would have to pass posts like this posts:{pageProps.posts} since we want posts to be rendered - spread posts separetly */}
        </Layout>
    )
}

//----------- for actual authentication create a method ------------- 
//appContext, ctx are different --> ctx is a property inside appContext
MyApp.getInitialProps = async({Component, ctx}) =>{   //destructure appContext here only  

    //const {Component, ctx} = appContext   //component is just an active page
    //console.log(appContext)
    //

    const {token} = parseCookies(ctx)    //first we check whether there is a token or not -- pass ctx then it will automatically parse over cookie

    let pageProps ={};

    //ctx pathname is nothing but the route to which user is to be redirected
    const protectedRoutes = 
        ctx.pathname==="/" || 
        ctx.pathname === "/[username]" ||
        ctx.pathname === "/post/[postId]" || 
        ctx.pathname === "/notifications" ||
        ctx.pathname === "/messages" || 
        ctx.pathname === "/search" ;

    //if there is no token --> user is not loggedin -> and if user is trying to access protected Routes(homepage) -> then we will redirect the user to login page
    if(!token){
        protectedRoutes && redirectUser(ctx, "/login")
    }else{
        //if token is there -> user loggedin--> wait for getInitialProps  to load
        if(Component.getInitialProps){   //if any componnet(an active page) is requesting getInitial props we gonna set it to pageProps
            pageProps = await Component.getInitialProps(ctx)
        }        

        //then, we make get request to the backend to get user information who was loggedin
        try {
            const res = await axios.get(`${baseUrl}/api/auth`, {headers: {Authorization:token}})
            
            //As we seen in Postman we will receive an object user, userFollowStats after succesfull authorization
            const {user, userFollowStats} = res.data

            //if there is any user(user exists) -> and user is accesing routes other than protectdRoutes(homepage) like login, signup --> we`re not gonna allow it, bcz user is already loggedin -> so redirect to homepage automatically (even if /login, /signup)
            if(user)    !protectedRoutes && redirectUser(ctx, "/")

            //set user, userFollowStats properties in pageProps --> initialProps
            pageProps.user = user;
            pageProps.userFollowStats = userFollowStats


        } catch (error) {       //if there is any error, destroy the cookie and redirect the user tpo login page
            destroyCookie(ctx, "token")
            redirectUser(ctx, "/login")
        }


    }

    //so after returning pageProps, it will automaticlly get added to the props of MyApp class
    return {pageProps}   //getInitiaProps always resolves to an object


}



export default MyApp;

//when we have created our own app.js file, we are basically overridding the defaults of next.js.
//so we have to create a method inside this _app.js so that we can use getInitialProps inside every page
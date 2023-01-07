import axios from "axios"
import baseUrl from "./baseUrl"
import catchErrors from "./catchErrors"
import cookie from "js-cookie"

//Create Axios instance so that no need to pass in headers again and again everytime we make a request
const Axios = axios.create({
    baseUrl:`${baseUrl}/api/posts`,
    headers:{Authorization : cookie.get("token")}
});


export async function submitNewPost(user,text, location, picUrl, setPosts, setNewPost, setError){

    try {
        //make post req to backend      
        //add the part of URL which is not common
        const res = await Axios.post("/", {text, location, picUrl}) //in the bosy, part, send the input data that user inputs
        const newPost={...res.data, user}

        //add new post to top of the array so that lastest posts --> on top
        setPosts(prev=>[newPost, ...prev])  //add the new post, spread the previous
        setNewPost({text:"", location:""});


    } catch (error) {
        const errorMsg =  catchErrors(error)
        setError(errorMsg)
    }

}



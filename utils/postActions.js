import axios from "axios"
import baseUrl from "./baseUrl"
import catchErrors from "./catchErrors"
import cookie from "js-cookie"

//Create Axios instance so that no need to pass in headers again and again everytime we make a request
const Axios = axios.create({
    baseURL:`${baseUrl}/api/posts`,
    headers:{Authorization : cookie.get("token")}
});


export async function submitNewPost(user, text, location, picUrl, setPosts, setNewPost, setError){

    try {
        //make post req to backend      
        //add the part of URL which is not common
        const res = await Axios.post("/", {text, location, picUrl}) //in the bosy, part, send the input data that user inputs
        
        //console.log(res);
        //console.log(res.data);  //since we are receiving only post._id --> which stored in res.data
        //console.log(res.data._id);
        
        const newPost = {
            _id:res.data,
            user, 
            text, 
            location,
            picUrl,
            likes:[],
            comments:[]
        };

        //add new post to top of the array so that lastest posts --> on top
        setPosts(prev=>[newPost, ...prev]);  //add the new post, spread the previous
        setNewPost({text:"", location:""});


    } catch (error) {
        const errorMsg =  catchErrors(error)
        setError(errorMsg)
    }

}


export async function deletePost(postId, setPosts, setShowToastr){

    try {
        //make dlt request
        await Axios.delete(`/${postId}`)
        //we set the posts with th id, other than the id right here
        setPosts(prev=>prev.filter(post=>post._id !== postId))
        setShowToastr(true);

    } catch (error) {
       console.log(catchErrors(error))
    }

}

export async function likePost(postId, userId, setLikes, like=true){

    try {
        
        //maintian like=true bool varibale so that we can handle both like, unlike in one func only
        if(like){
            await Axios.post(`/like/${postId}`);
            setLikes(prev => [...prev, {user: userId}]) //check likes syntax in PostModelSchema
        }
        else if(!like){
            await Axios.put(`/unlike/${postId}`);
            setLikes(prev => prev.filter(like => like.user !== userId));    //get hold of prev likes variable (on frontend side) loop through it and set the array with all the prev values whos likes.userid not equals to userId
        }

    } catch (error) {
        alert(catchErrors(error));
    }
    

}

export async function postComment(postId, user, text, setComments, setText){

    try {
        //make req to 
        const res = await Axios.post(`/comment/${postId}`, {text})

        const newComment = {
            _id:res.data,
            user,
            text,
            date:Date.now()
        };

        setComments(prev => [newComment, ...prev])
        setText("")     //the inpput field is set to empty after submitting the comment


    } catch (error) {
        alert(catchErrors(error));
    }

}

export async function deleteComment(postId, commentId, setComments){

    try {
        
        await Axios.delete(`/${postId}/${commentId}`)
        setComments(prev => prev.filter(comment => comment._id !== commentId))  //get hold of the variable(on frontend side) that stores the comments array --> filter through it --> put all the prev cmts whos commetnId doesn`t match(Bcz it is deleted)

    } catch (error) {
        alert(catchErrors(error));
    }

}
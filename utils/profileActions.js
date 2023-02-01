import axios from "axios"
import baseUrl from "./baseurl"
import catchErrors from "./catchErrors"
import cookie from "js-cookie"
import Router from "next/Router"

//Create Axios instance so that no need to pass in headers again and again everytime we make a request
//Just like we did in postActions
const Axios = axios.create({
    baseURL:`${baseUrl}/api/profile`,
    headers:{Authorization : cookie.get("token")}
});



export async function followUser(userToFollowId, setUserFollowStats){
    try {
        await Axios.post(`/follow/${userToFollowId}`)

        setUserFollowStats(prev => ({
            ...prev,                                                    //spreading the prev
            following: [...prev.following, {user: userToFollowId}]      //spread prev following data and add new
        }));

    } catch (error) {
        alert(catchErrors(error))
    }
};


export async function unfollowUser(userToUnfollowId, setUserFollowStats){
    try {
        await Axios.put(`/unfollow/${userToUnfollowId}`)

        setUserFollowStats(prev => ({
            ...prev,                                                    //spreading the prev
            following: prev.following.filter(following => following.user !== userToUnfollowId)      //get prev, and select all users except the user with userToUnfollowID
        }));

    } catch (error) {
        alert(catchErrors(error))
    }
};

export async function profileUpdate(profile, setLoading, setError, profilePicUrl){
    
    try {
        const {bio,facebook,twitter,youtube,linkedin} = profile

        //make post request , along with the things to post :)
        await Axios.post(`/update`, {bio,facebook,twitter,youtube,linkedin, profilePicUrl})
        setLoading(false)
        Router.reload();    //reload the page inorder to get changes reflected

    } catch (error) {
        setError(catchErrors(error))
        setLoading(false)
    }
};


export async function passwordUpdate(setSuccess, userPasswords){

    try {
        const {currentPassword, newPassword} = userPasswords
        
        await Axios.post(`/settings/password`, {currentPassword, newPassword})
        setSuccess(true)

    } catch (error) {
        alert(catchErrors(error))
    }
};


export async function toggleMessagePopup(popupSetting, setPopupSetting, setSuccess){

    try {
        await Axios.post(`/settings/messagePopup`)

        setPopupSetting(!popupSetting)
        setSuccess(true)

    } catch (error) {
        alert(catchErrors(error))
    }
};
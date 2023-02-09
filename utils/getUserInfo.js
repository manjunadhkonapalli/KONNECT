import axios from "axios"
import baseUrl from "./baseUrl"
import cookie from "js-cookie"


async function getUserInfo(userToFindId){
    try {
        //make req to backend
        const res = await axios.get(`${baseUrl}/api/chats/user/${userToFindId}`, {
            headers : {Authorization : cookie.get("token")}
        });

        return {name: res.data.name, profilePicUrl: res.data.profilePicUrl}
        
    } catch (error) {
        alert("Error looking for user")
    }
};

export default getUserInfo;
import React,{useEffect, useState} from 'react'
import {Button, Image, List} from 'semantic-ui-react'
import Spinner from "../Layout/Spinner"     //just a loading animation
import axios from "axios"
import baseUrl from "../../utils/baseUrl"
import cookie from "js-cookie"      //bcz in the backend it the protected route
import {NoFollowData} from "../Layout/NoData"
import {followUser, unfollowUser} from "../../utils/profileActions"

function Followers({user, loggedUserFollowStats, setUserFollowStats, profileUserId}) {
  
    
    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);      //this is when user clicks to follow or unfollow any user from follwers tab
  
    //using useEffect to bring followers data from backend
    useEffect(()=>{
        async function getFollowers(){
            setLoading(true)

            try {
                const res = await axios.get(`${baseUrl}/api/profile/followers/${profileUserId}`, {
                    headers: {Authorization: cookie.get("token")}
                })
                setFollowers(res.data)
            } catch (error) {
                alert("Error Loading Followers")
            }
            setLoading(false)
        };
        getFollowers()
    }, [])      //renders first time when page loads


    return (
    <>
        {loading ?<Spinner />:(followers.length>0 ?
        followers.map(profileFollower => {
{/*This is basically checking if i am following back to my follower or not ---> checking if my follower is their in my following list --> to get FOLLOW BACK or ADD USER option */}
            const isFollowing = loggedUserFollowStats.following.length>0 && 
            loggedUserFollowStats.following.filter(
                following => following.user === profileFollower.user._id).length>0;

            return (
                <>
                    <List key={profileFollower.user._id} divided verticalAlign="middle">
                        <List.Item>
                            <List.Content floated="right">
{/* If opened profileId(mahanth) not equal to loggged user Id(manjunadh), then in followers, following of mahanth 
we dont show that option that whether the users there,  are following me(manjunadh) or not. That should be only option in our own profile
 FOLLOW BACK  ,,,   FOLLOWING options :)    */ }
                                {profileFollower.user._id !== user._id && (
                                    <Button 
                                    color={isFollowing ? "instagram" : "twitter"} 
                                    content={isFollowing?"Following":"Follow"}
                                    icon={isFollowing ? 'check' : 'add user'}
                                    disabled={followLoading}
                                    onClick={async()=>{
                                        setFollowLoading(true)
                                        isFollowing ? 
                                        await unfollowUser(profileFollower.user._id, setUserFollowStats) : 
                                        await followUser(profileFollower.user._id, setUserFollowStats)

                                        setFollowLoading(false)
                                    }}
                                    />
                                )}
                            </List.Content>
                            <Image avatar src={profileFollower.user.profilePicUrl} />
                            <List.Content as="a" href={`/${profileFollower.user.username}`}>
                                {profileFollower.user.name}
                            </List.Content>
                        </List.Item>
                    </List>
                </>
            )
            
        }) : <NoFollowData followersComponent={true} />)}
    </>
  )
}

export default Followers
import React,{useEffect, useState} from 'react'
import {Button, Image, List} from 'semantic-ui-react'
import Spinner from "../Layout/Spinner"     //just a loading animation
import axios from "axios"
import baseUrl from "../../utils/baseUrl"
import cookie from "js-cookie"      //bcz in the backend it the protected route
import {NoFollowData} from "../Layout/NoData"
import {followUser, unfollowUser} from "../../utils/profileActions"

function Following({user, loggedUserFollowStats, setUserFollowStats, profileUserId}) {
  
    
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);      //this is when user clicks to follow or unfollow any user from follwers tab
  
    //using useEffect to bring followers data from backend
    useEffect(()=>{
        async function getFollowing(){
            setLoading(true)

            try {
                const res = await axios.get(`${baseUrl}/api/profile/following/${profileUserId}`, {
                    headers: {Authorization: cookie.get("token")}
                })
                setFollowing(res.data)
            } catch (error) {
                alert("Error Loading Followings")
            }
            setLoading(false)
        };
        getFollowing()
    }, [])      //renders first time when page loads


    return (
    <>
        {loading ?<Spinner />:(following.length>0 ?
        following.map(profileFollowing => {
{/*This option might not be much useful here. Bcz, in follower tab, possible options could be , ADD USER, FOLLOWING, based on wthether we are following our follower or not
But here this is following tab ---> only possible option could be FOLLOWING 
SO, no major changes here compared to follower.js page*/}
            const isFollowing = loggedUserFollowStats.following.length>0 && 
            loggedUserFollowStats.following.filter(
                following => following.user === profileFollowing.user._id).length>0;

            return (
                <>
                    <List key={profileFollowing.user._id} divided verticalAlign="middle">
                        <List.Item>
                            <List.Content floated="right">
{/* If opened profileId(mahanth) not equal to loggged user Id(manjunadh), then in followers, following of mahanth 
we dont show that option that whether the users there,  are following me(manjunadh) or not. That should be only option in our own profile
 FOLLOW BACK  ,,,   FOLLOWING options :)    */ }
                                {profileFollowing.user._id !== user._id && (
                                    <Button 
                                    color={isFollowing ? "instagram" : "twitter"} 
                                    content={isFollowing?"Following":"Follow"}
                                    icon={isFollowing ? 'check' : 'add user'}
                                    disabled={followLoading}
                                    onClick={async()=>{
                                        setFollowLoading(true)
                                        isFollowing ? 
                                        await unfollowUser(profileFollowing.user._id, setUserFollowStats) : 
                                        await followUser(profileFollowing.user._id, setUserFollowStats)

                                        setFollowLoading(false)
                                    }}
                                    />
                                )}
                            </List.Content>
                            <Image avatar src={profileFollowing.user.profilePicUrl} />
                            <List.Content as="a" href={`/${profileFollowing.user.username}`}>
                                {profileFollowing.user.name}
                            </List.Content>
                        </List.Item>
                    </List>
                </>
            )
            
        }) : <NoFollowData followingComponent={true} />)}
    </>
  )
}

export default Following
import React, { useEffect, useState} from 'react'
import {useRouter} from "next/router"
import axios from "axios"
import baseUrl from "../utils/baseUrl"
import {parseCookies} from "nookies"
import {NoProfile, NoProfilePosts} from "../components/Layout/NoData"
import cookie from "js-cookie"
import {Grid, Placeholder} from "semantic-ui-react"
import ProfileMenuTabs from '../components/Profile/ProfileMenuTabs'
import ProfileHeader from '../components/Profile/ProfileHeader'
import CardPost from "../components/Post/CardPost"
import { PlaceHolderPosts } from '../components/Layout/PlaceHolderGroup'
import {PostDeleteToastr} from "../components/Layout/Toastr"
import Followers from '../components/Profile/Followers'
import Following from '../components/Profile/Following'
import UpdateProfile from "../components/Profile/UpdateProfile"
import Settings from "../components/Profile/Settings"


function ProfilePage({profile, followersLength, followingLength, errorLoading, user, userFollowStats}) {
    
    //initilaize the hook first
    const router = useRouter()

    const[posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    const[activeItem, setActiveItem] = useState("profile")  //to keep trcak of active itrm -> profile, followers, following, Update Profile, settings
    const handleItemClick = item => setActiveItem(item)

    const [loggedUserFollowStats, setUserFollowStats] = useState(userFollowStats)   //follow stat information of the user who have logged in

    const [showToastr, setShowToastr] = useState(false);

    const ownAccount = profile.user._id === user._id


    if(errorLoading) return <NoProfile />;

    useEffect(()=>{
      
      async function getPosts(){
        setLoading(true)

        try {
          const {username} = router.query;
          const token = cookie.get("token")

          const res = await axios.get(`${baseUrl}/api/profile/posts/${username}`,{
            headers : {Authorization: token}
          });

          setPosts(res.data);
          
        } catch (error) {
          alert("Error Loading Posts");
        }
        setLoading(false)
      };

      getPosts();
    }, [router.query.username])    //it renders when the router.query changes


    useEffect(()=>{
      showToastr && setTimeout(()=> setShowToastr(false), 3000)
    }, [showToastr])    //to set the timeout when the showToastr changes

  return (
    <>
    {showToastr && <PostDeleteToastr /> }
      <Grid stackable >
        <Grid.Row>
          <Grid.Column>
            <ProfileMenuTabs 
              activeItem={activeItem}
              handleItemClick = {handleItemClick}
              followersLength = {followersLength}
              followingLength = {followingLength}
              ownAccount = {ownAccount}
              loggedUserFollowStats = {loggedUserFollowStats}
              />
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column>
            {activeItem === "profile" && (
              <>
                <ProfileHeader 
                  profile={profile}
                  ownAccount={ownAccount}
                  loggedUserFollowStats={loggedUserFollowStats}
                  setUserFollowStats={setUserFollowStats}
                  />

                  {loading ? <PlaceHolderPosts /> :( 
                    posts.length>0 ? 
                    posts.map(post=>(
                      <CardPost 
                      key={post._id} 
                      post={post} 
                      user={user} 
                      setPosts={setPosts} 
                      setShowToastr={setShowToastr}
                      />)) : <NoProfilePosts />
                       )}
              </>
            )}

            {activeItem === "followers" && 
            <Followers 
            user={user} 
            loggedUserFollowStats={loggedUserFollowStats}
            setUserFollowStats={setUserFollowStats} 
            profileUserId={profile.user._id}
             />}

            {activeItem === "following" && 
            <Following 
            user={user} 
            loggedUserFollowStats={loggedUserFollowStats}
            setUserFollowStats={setUserFollowStats} 
            profileUserId={profile.user._id}
             />}

            {activeItem === "updateProfile" && <UpdateProfile Profile={profile} />}
            {activeItem === "settings" && <Settings newMessagePopup={user.newMessagePopup} />}
          </Grid.Column>
        </Grid.Row>

      </Grid>
    </>
  )
}

ProfilePage.getInitialProps = async(ctx)=>{

  try {
    const {username} = ctx.query;
    const {token} = parseCookies(ctx)

    const res = await axios.get(`${baseUrl}/api/profile/${username}`, {headers:{Authorization:token}})
    
    const {profile, followersLength, followingLength} = res.data;

    return {profile, followersLength, followingLength};


  } catch (error) {
    return {errorLoading:true}
  }

}





//if not with next.js dynamic routes --> we would have been used React Router
//<Router path="/username" component={Profile} />

//if we were using getInitialProps
// ProfilePage.getInitialProps = async (ctx)=>{
//   const {username} = ctx.query;
//   console.log({username});
//   return {}                  //GetInitialProps always resolves to an object
// }

export default ProfilePage
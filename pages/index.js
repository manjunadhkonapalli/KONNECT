import React, { useEffect, useState, useRef } from 'react'
import io from "socket.io-client"
import axios from "axios"
import baseUrl from "../utils/baseUrl"
import CreatePost from "../components/Post/CreatePost"
import CardPost from "../components/Post/CardPost"
import {Segment} from "semantic-ui-react"
import {parseCookies} from "nookies"
import {NoPosts} from "../components/Layout/NoData"
import {PostDeleteToastr} from "../components/Layout/Toastr"
import InfiniteScroll from 'react-infinite-scroll-component'
import {PlaceHolderPosts, EndMessage} from "../components/Layout/PlaceHolderGroup"
import cookie from 'js-cookie'
import getUserInfo from '../utils/getUserInfo'
import MessageNotificationModal from '../components/Home/MessageNotificationModal'
import newMsgSound from "../utils/newMsgSound"
import NotificationPortal from '../components/Home/NotificationPortal'

function Index({user, postsData, errorLoading}) {

  const [posts, setPosts] = useState(postsData);    //postData is assigned to posts & that is being passed to all the components that needs post data
  const [showToastr, setShowToastr] = useState(false);    // for React Toastify package -> gonna work after we hvae rendered all the posts
  const [hasMore, setHasMore] = useState(true);  //related to infinte scroll --> hasMore basically means that, if there is more data to fetch from the backend ?
  const [pageNumber, setPageNumber] = useState(2);

  //Below 3 state are for receiving messages in any page
  const socket = useRef()
  const [newMessageReceived, setNewMessageReceived] = useState(null)
  const [newMessageModal, showNewMessageModal] = useState(false)


  const [newNotification, setNewNotification] = useState(null)
  const [notificationPopup, showNotificationPopup] = useState(false)   //control the visibility of the popup with this state


  //useEfect is on mount ---> putting elements into DOM
  useEffect(()=>{

    //If useref is initiated then we will have some value in current. IF NOT --> Connecting to the server
    if(!socket.current){
      socket.current = io(baseUrl)
    }

    //In emit func, we are sending params in object format. So we will catch then in object format only in socket.on func
    if(socket.current){
      //We will emit the event JOIN so that we can keep the track of users who are online
      //This part of code in in Home page file --> so if user is on homepoge --> it will be considered as online
      socket.current.emit('join', {userId: user._id});

      socket.current.on('newMsgReceived', async({newMsg})=>{

        //Call GET USER INFO function
        const {name, profilePicUrl} = await getUserInfo(newMsg.sender)

        if(user.newMessagePopup){
          setNewMessageReceived({
            ...newMsg,
            senderName: name,
            senderProfilePic: profilePicUrl
          });
          showNewMessageModal(true);
        }
        newMsgSound(name);
      });
    }

    document.title = `Welcome, ${user.name.split(' ')[0]}`;   //$ is the jQuery function

    //Cleanup function
    // return ()=>{
    //   if(socket.current){
    //     socket.current.emit('disconnect');
    //     socket.current.off();
    //   }
    // }


  }, [])    //empty array means -> runs on only first render


  //to show toaster, when deleted the post
  useEffect(()=>{
    showToastr && setTimeout(()=>setShowToastr(false), 3000)  //is showTaostr is true, set it for false for 3 sec
  }, [showToastr])


  async function fetchDataOnScroll(){

    try {
      const res = await axios.get(`${baseUrl}/api/posts`, {
        headers:{Authorization:cookie.get("token")},
        params: {pageNumber}    //we recieve this kind of params in req.query
      });

      //if no more posts on backend, data.length is 0
      if(res.data.length===0)setHasMore(false);

      //if there is data -> spread the prev, spread the res.data (currently fetched data)
      setPosts(prev => [...prev, ...res.data])
      setPageNumber(prev => prev+1)
      
    } catch (error) {
      alert("Error Fetching Posts")
    }
    
  }

  useEffect(()=>{

    if(socket.current){
      socket.current.on("newNotificationReceived", ({name, profilePicUrl, username, postId})=>{

        setNewNotification({name, profilePicUrl, username, postId})

        showNotificationPopup(true);
      })
    }

  }, [])

  return (
    <>
    {notificationPopup && newNotification !== null && 
    <NotificationPortal 
      newNotification={newNotification}
      notificationPopup={notificationPopup}
      showNotificationPopup={showNotificationPopup}
    />}

    {showToastr && <PostDeleteToastr />}

    {newMessageModal && newMessageReceived !== null && 
      <MessageNotificationModal 
        socket={socket} 
        showNewMessageModal={showNewMessageModal} 
        newMessageModal={newMessageModal} 
        newMessageReceived={newMessageReceived}
        user={user}
      />}

      <Segment>
        <CreatePost user={user} setPosts={setPosts} />
        {posts.length === 0 || errorLoading ? <NoPosts /> :
        <InfiniteScroll 
          hasMore={hasMore} 
          next={fetchDataOnScroll} 
          loader={<PlaceHolderPosts />} 
          endMessage={<EndMessage />} 
          dataLength={posts.length}
        >
          {posts.map(post=>
          <CardPost 
          key={post._id} 
          socket={socket}
          post={post} 
          user={user} 
          setPosts={setPosts}
          setShowToastr={setShowToastr}
        />)}
        </InfiniteScroll>}
        
      </Segment>
      
    </>
  )
}

//we`re gonna receive this initial props by default into home page ---> to above function --> so PostsData will work fine
Index.getInitialProps = async(ctx) =>{

  try {
    //It is a protected route on the backend to get all the posts 
    //make get request when we have token (cookie) in our local storage browser
    const {token} = parseCookies(ctx);  //we get hold of authentication token -> for header in postman
    
    const res = await axios.get(`${baseUrl}/api/posts`, {
      headers:{Authorization:token},    //pass headers like we see in postman -- it is kind of ticket to a movie. otherwise thearte wont allows us 
      params : {pageNumber:1}
    })  

    //always return obj {} in get initial props
    return {postsData: res.data }   //res.data contains, posts ---> that is being asignd to a custom field postsData
    
  } catch (error) {
    return {errorLoading :true}
  }

}   

export default Index    
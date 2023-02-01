import React, { useEffect, useState } from 'react'
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

function Index({user, postsData, errorLoading}) {

  const [posts, setPosts] = useState(postsData);    //postData is assigned to posts & that is being passed to all the components that needs post data
  const [showToastr, setShowToastr] = useState(false);    // for React Toastify package -> gonna work after we hvae rendered all the posts
  const [hasMore, setHasMore] = useState(true);  //related to infinte scroll --> hasMore basically means that, if there is more data to fetch from the backend ?
  const [pageNumber, setPageNumber] = useState(2);

  //useEfect is on mount ---> putting elements into DOM
  useEffect(()=>{
    document.title = `Welcome, ${user.name.split(' ')[0]}`;   //$ is the jQuery function
  }, [])    //empty array means -> runs on only first render


  //to show toaster, when deleted the post
  useEffect(()=>{
    showToastr && setTimeout(()=>setShowToastr(false), 3000)  //is showTaostr is true, set it for false for 3 sec
  }, [showToastr])


  //small bug fix
  //if posts length is 0 or there is error Loading then return NoPost component
  //NoPost is just a custom component, that shows -> no posts are available right now --> Make sure to follow someone:)
  // if(posts.length === 0 || errorLoading){
  //   return <NoPosts />
  // }

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


  return (
    <>
    {showToastr && <PostDeleteToastr />}
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
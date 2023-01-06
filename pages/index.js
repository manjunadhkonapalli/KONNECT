import React, { useEffect, useState } from 'react'
import axios from "axios"
import baseUrl from "../utils/baseUrl"
import CreatePost from "../components/Post/CreatePost"
import CardPost from "../components/Post/CardPost"
import {Segment} from "semantic-ui-react"
import {parseCookies} from "nookies"
import {NoPosts} from "../components/Layout/NoData"


function Index({user, postsData, errorLoading}) {

  const [posts, setPosts] = useState(postsData);    //postData is assigned to posts & that is being passed to all the components that needs post data
  const [showToastr, setShowToastr] = useState(false);    // for React Toastify package -> gonna work after we hvae rendered all the posts
 

  //useEfect is on mount ---> putting elements into DOM
  useEffect(()=>{
    document.title = `Welcome, ${user.name.split(' ')[0]}`;   //$ is the jQuery function
  }, [])    //empty array means -> runs on only first render


  //if if posts length is 0 or there is error Loading then return NoPost component
  //NoPost is just a custom component, that shows -> no posts are available right now --> Make sure to follow someone:)
  if(posts.length === 0 || errorLoading){
    return <NoPosts />
  }


  return (
    <>
      <Segment>
        <CreatePost user={user} setPosts={setPosts} />
          {posts.map(post=>
          <CardPost 
          key={post._id} 
          post={post} 
          user={user} 
          setPosts={setPosts}
          setShowToastr={setShowToastr}
        />)}
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
    
    const res = await axios.get(`${baseUrl}/api/posts`, {headers:{Authorization:token}})  //pass headers like we see in postman -- it is kind of ticket to a movie. otherwise thearte wont allows us 

    //always return obj {} in get initial props
    return {postsData: res.data }   //res.data contains, posts ---> that is being asignd to a custom field postsData
    
  } catch (error) {
    return {errorLoading :true}
  }

}   

export default Index    
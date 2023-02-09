import React, {useState} from "react";
import axios from "axios"
import baseUrl from "../../utils/baseUrl"
import { parseCookies } from "nookies";
import {Card, Icon, Image, Divider, Segment, Container, CardDescription} from "semantic-ui-react";
import PostComments from "../../components/Post/PostComments"
import CommentInputField from "../../components/Post/CommentInputField"
import LikesList from '../../components/Post/LikesList'
import Link from "next/link"
import {likePost} from "../../utils/postActions"
import calculateTime from "../../utils/calculateTime";
import {NoPostFound} from "../../components/Layout/NoData"


function PostPage({post, errorLoading, user}){

    if(errorLoading){
        return <NoPostFound />;
    }

    //console.log("post")
    //console.log(post)

    const [likes, setLikes] = useState(post.likes);
    //filtering over the likes array and checking inside it if there is a user with this userId who is loggged in
    const isLiked = likes.length > 0 && likes.filter(like=>like.user === user._id).length > 0;
    const [comments, setComments] = useState(post.comments) 

    return (
    <Container text>

    <Segment>
      <Card color="teal" fluid>
        {post.picUrl && 
        <Image 
          src={post.picUrl} 
          style={{cursor:"pointer"}} 
          floated="left" 
          wrapped 
          ui={false}
          alt="Postimage" 
          onClick={()=>setShowModal(true)}
        />}
        
        <Card.Content>
          <Image floated="left" src={post.user.profilePicUrl} avatar circular />

          <Card.Header>
            <Link href={`/${post.user.username}`} >
              <a>{post.user.name}</a>
            </Link>
          </Card.Header>

          <Card.Meta>
            {calculateTime(post.createdAt)}
          </Card.Meta>

          {post.location && <Card.Meta content={post.location} />}

          <CardDescription style={{fontSize:"17px", letterSpacing:"0.1px", wordSpacing:"0.35px"}} >
            {post.text}
          </CardDescription>
        </Card.Content>


        <Card.Content extra >
            <Icon 
              name={isLiked?"heart":"heart outline"} 
              color="red" 
              style={{cursor:"pointer"}} 
              onClick={()=>likePost(post._id, user._id, setLikes, isLiked?false:true )}
            />

          <LikesList 
            postId={post._id}
            trigger={
              likes.length>0 && (
              <span className="spanLikesList" >
                {`${likes.length} ${likes.length === 1 ? "like" : "likes" }`}
              </span>
            )}
           />

            <Icon name="comment outline" style={{marginLeft:"7px"}} color="blue" />
          
            {comments.length>0 && comments.map((comment) =>
              <PostComments 
                key={comment._id} 
                comment={comment} 
                postId={post._id} 
                user={user} 
                setComments={setComments} 
              />)
              }
              
              <Divider hidden/>

              <CommentInputField 
                user={user} 
                postId={post._id} 
                setComments={setComments} 
                />

        </Card.Content>
      </Card>
    </Segment>
    <Divider hidden/>

</Container>
    )
}

//Get initial props for data to be loaded previosly
PostPage.getInitialProps = async(ctx)=>{
    try {
        //desructire out the query - in dynamic routes, we will receive parameter in query method
        const {postId} = ctx.query  
        const {token} = parseCookies(ctx)

        const res= await axios.get(`${baseUrl}/api/posts/${postId}`, {headers:{Authorization:token}})
        
        return {post : res.data}    //always getInitialProps returns in an object form only

    } catch (error) {
        return {errorLoading:true}
    }
}

export default PostPage;
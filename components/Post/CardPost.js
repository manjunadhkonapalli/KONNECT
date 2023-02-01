import React, {useState} from 'react'
import {Card, Icon, Image, Divider, Segment, Button, Popup, Header, Modal, CardDescription, CardContent, ModalContent} from "semantic-ui-react"
import PostComments from "./PostComments"
import CommentInputField from "./CommentInputField"
import Link from "next/link"
import calculateTime from "../../utils/calculateTime"
import { deletePost, likePost } from '../../utils/postActions'
import LikesList from './LikesList'
import ImageModal from "./ImageModal"
import NoImageModal from './NoImageModal'

function CardPost({post, user, setPosts, setShowToastr}) {

const [likes, setLikes] = useState(post.likes);

//filtering over the likes array and checking inside it if there is a user with this userId who is loggged in
const isLiked = likes.length !== 0 && likes.filter(like=>like.user === user._id).length > 0;

const [comments, setComments] = useState(post.comments)

const [error, setError] = useState(null)  //handles any error inliking, commenting 

const [showModal, setShowModal] = useState(false)


function addPropsToModal(){
  return { post, user, likes, setLikes, isLiked, comments, setComments}
}

  return (
  <>
  {/* We can place this anywhere we want in the return section(top, middle, bottom). Bcz no matter wherever we placeit, since it is state, -> when it gets updated, that state varibale is automaticllly rendered (def of state itself) */}
  {showModal && (
    <Modal 
      open={showModal} 
      closeIcon 
      closeOnDimmerClick 
      onClose={() => setShowModal(false)} >

        <ModalContent>
          {post.picUrl ? <ImageModal {...addPropsToModal()} /> : <NoImageModal {...addPropsToModal()} />}
        </ModalContent>



    </Modal>
  )}
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
          {(user.role === "root" || post.user._id === user._id) && (
            <>
              <Popup on="click" position="top right" trigger={<Image src="/deleteIcon.svg" style={{cursor:"pointer"}} size = "mini" floated="right" />} >
                <Header as="h4" content="Are you sure?" />
                <p>This action is irreversible!</p>
                <Button color="red" icon="trash" content="Delete" onClick={()=>deletePost(post._id, setPosts, setShowToastr)} />
              </Popup>
            </>
          )}

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
          
            {comments.length>0 && comments.map((comment, index) => (
              index < 3 && (
              <PostComments 
                key={comment._id} 
                comment={comment} 
                postId={post._id} 
                user={user} 
                setComments={setComments} 
              />)
              ))}

              {comments.length>3 && 
              <Button 
              content="View More" 
              color="teal" 
              basic 
              circular 
              onClick={()=>setShowModal(true)} 
              />}
              
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
  </>
)}

export default CardPost
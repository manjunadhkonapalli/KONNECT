import React, {useState} from 'react'
import {Comment, Grid, Icon} from "semantic-ui-react"
import calculatedTime from '../../utils/calculateTime'

function PostComments({user, postId, comment, setComments}) {

  const [disabled, setDisabled] = useState(false);


  return (
   <>
    <Comment.Group>
      <Grid  container verticalAlign='middle'>
        
        <Grid.Column width={14}>
          <Comment>
            <Comment.Avatar src={comment.user.profilePicUrl} />
            <Comment.Content>
              <Comment.Author as='a' href={`/${comment.user.username}`} >{comment.user.name}</Comment.Author>  
              <Comment.Metadata>{calculatedTime(comment.date)}</Comment.Metadata>              
              <Comment.Text>{comment.text}</Comment.Text>               
            </Comment.Content>
          </Comment>
        </Grid.Column>

        <Grid.Column width={2}>
          {(user.role === "root" || comment.user._id === user._id) && (
            <Icon disabled={disabled} name="trash"color="teal"  />
          )}
        </Grid.Column>

      </Grid>
      
    </Comment.Group>
    



   </>
  )
}

export default PostComments
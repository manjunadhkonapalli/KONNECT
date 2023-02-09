import React from 'react'
import {Feed} from "semantic-ui-react"
import calculateTime from "../../utils/calculateTime"

function CommentNotification({notification}) {
  return (
    <>
      <Feed.Event>
        <Feed.Label image={notification.user.profilePicUrl} />
        <Feed.Content>

          <Feed.Summary>
            <>
              <Feed.User as="a" href={`${notification.user.username}`}>
                {notification.user.name}
              </Feed.User> {' '} commented on your {' '} <a href={`/post/${notification.post._id}`}>post</a>
              <Feed.Date>{calculateTime(notification.date)}</Feed.Date>
            </>
          </Feed.Summary>

{/*We are checking if its have a picUrl so that it can display a small pic */}
          {notification.post.picUrl && <Feed.Extra images >
            <a href={`/post/${notification.post._id}`}>
              <img src={notification.post.picUrl} />
            </a>
          </Feed.Extra>}

{/*this is for displaying the text of comment*/}
          <Feed.Extra text >
            <strong>{notification.text}</strong>
          </Feed.Extra>

        </Feed.Content>
      </Feed.Event>
      <br />
    </>
  )
}

export default CommentNotification
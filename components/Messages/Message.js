import React, {useState} from 'react'
import {Icon, Popup} from "semantic-ui-react"
import calculateTime from '../../utils/calculateTime'

function Message({message, user, deleteMsg, bannerProfilePic, divRef}) {

    const [deleteIcon, showDeleteIcon] = useState(false);   //if we are the sender of the msg, if we click on msg, shows dlt icon --> from our own inbox but not from recivers inbox -> like dlt for me btn on whatsapp

    const ifYouSender = message.sender===user._id;  //tells if we are the sender of that msg

  return (
    /*This is the div which surrounds around our msg "hyy".
    Not the entire chat box, but just the little cute purple, blue color containers with rightbottom, leftbottom sharps */
    <div className="bubbleWrapper" ref={divRef}>

        <div className={ifYouSender ? "inlineContainer own" : "inlineContainer"} onClick={()=>ifYouSender && showDeleteIcon(!deleteIcon)} >
            {/* <img className='inlineIcon' src={ifYouSender ? user.profilePicUrl : bannerProfilePic} /> */}
            
            <div className={ifYouSender ? "ownBubble own" : "otherBubble other"}>
                {message.msg}
            </div>

            {deleteIcon && 
            <Popup 
                trigger={<Icon name="trash" color="red" style={{cursor: "pointer"}} onClick={()=>deleteMsg(message._id)} />}
                content="This will only delete the message from your inbox!"
                position="top right"
            />}

        </div>
        
        <span className={ifYouSender ? "own" : "other"} >
            {calculateTime(message.date)}
        </span>

    </div>
  )
}

export default Message
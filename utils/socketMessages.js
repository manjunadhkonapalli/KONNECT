const messagesLoaded = (setMessages, setBannerData, openChatId)=>{

    setMessages(chat.messages)
    setBannerData({
        name:chat.messagesWith.name,
        profilePicUrl:chat.messagesWith.profilePicUrl
    });

    openChatId.current = chat.messagesWith._id  //query string = user id with whom we are chatting
    divRef.current && scrollDivToBottom(divRef);    //This is to implement autoscrollto bottom in msgs div, after they are loaded from another page to msgs/chats page

}
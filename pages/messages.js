import React, {useEffect, useRef, useState} from 'react'
import io from "socket.io-client"
import axios from "axios"
import baseUrl from "../utils/baseUrl"
import {parseCookies} from "nookies"
import {Segment, Header, Divider, Comment, Grid, Icon} from "semantic-ui-react"
import Chat from "../components/Chats/Chat"
import ChatListSearch from "../components/Chats/ChatListSearch"
import {useRouter} from "next/router"
import {NoMessages} from "../components/Layout/NoData"
import Banner from "../components/Messages/Banner"
import Message from "../components/Messages/Message"
import MessageInputField from "../components/Messages/MessageInputField"
import getUserInfo from "../utils/getUserInfo"
import newMsgSound from "../utils/newMsgSound"
import cookie from "js-cookie"

async function scrollDivToBottom(divRef){
  divRef.current !== null && divRef.current.scrollIntoView({behaviour : "smooth"});
};


function Messages({chatsData, user}) {

    const [chats, setChats] = useState(chatsData)
    const router = useRouter();   //intialize the hook
    const [connectedUsers, setConnectedUsers] = useState([])  //we can use this state to check if a user is online or not

    const [messages, setMessages] = useState([])
    const [bannerData, setBannerData] = useState({name:"", profilePicUrl:""});
   
    //This divref for pointing to that latest msg either sent or recived --> scrolls an elmt to the visible area of browsers window
    const divRef = useRef();

    // This ref is for persisting the state of query string in url throughout re-renders. This ref is the query string inside the url
    const openChatId = useRef("")

    const socket = useRef()

    // This is for connecting the socket
    //when clicks on msg, it should redirect user to the first chat automatically
    useEffect(()=>{

      //useRefs have current property - thats why socket.current. or else in server.js -> only socket
      if(!socket.current){
        socket.current = io(baseUrl)  //this is making the socket.io connection
      }

      //send data using socket - we use "emit"
      if(socket.current){
        /*socket.emit(event_name, object) 
        // socket.current.emit("helloWorld", {name:"Manjunadh", age:"21"})   //we can create and fire custom events using this function
        // socket.current.on("dataReceived", ({msg})=>{
        //   console.log(msg)
        // })
        */
        
        //In emit func, we are sending params in object format. So we will catch then in object format only in socket.on func
        //We will emit the event JOIN so that we can keep the track of users who are online
        socket.current.emit("join", {userId: user._id})   //emit or send the data - FIRST OF ALL we are emmiting on the mount when the component mounts

        socket.current.on("connectedUsers", ({users})=>{  //listen for the data and receive it
          users.length > 0 && setConnectedUsers(users);
        }) 

      }

      //if chats are there, and no query string inside the URL only then push the user to the first chat
      if(chats.length>0 && !router.query.message){
        router.push(`/messages?message=${chats[0].messagesWith}`, undefined, {
          shallow: true
        })
      }

      // //CLEANUP FUNCTION
      // return ()=>{
      //   if(socket.current){
      //     //remove the user from the server 
      //     socket.current.emit("disconnect")
      //     socket.current.off()  //this will remove this event listener
      //   }
      // }

    }, [])  //on mount -> when component mounts it will redierct us to the first chat


    //For Loading the messages
    // Must use this useEffect for loadMessages below above useEffect. Bcz in above we are making the connection. it should be first
    useEffect(()=>{
      function loadMessages(){
        socket.current.emit("loadMessages", {
          userId:user._id, 
          messagesWith:router.query.message
        });

        socket.current.on("messagesLoaded", ({chat})=>{
          setMessages(chat.messages)
          setBannerData({name:chat.messagesWith.name, profilePicUrl:chat.messagesWith.profilePicUrl})

          openChatId.current = chat.messagesWith._id  //query string = user id with whom we are chatting
          divRef.current && scrollDivToBottom(divRef);    //This is to implement autoscrollto bottom in msgs div, after they are loaded from another page to msgs/chats page
        })

        //if noChat is found with an user, redirect to its chat area from previous ones chat area when clicked
        socket.current.on("noChatFound", async()=>{
          const {name, profilePicUrl} = await getUserInfo(router.query.message)

          setBannerData({name, profilePicUrl});   //ES6 syntax
          setMessages([]);
          openChatId.current = router.query.message
        });

      };

      if(socket.current && router.query.message){
        loadMessages()
      }

    },[router.query.message]) //trigger whenever query string changes inside the url


    //for sending the new messages
    async function sendMsg(msg){

      if(socket.current){
        socket.current.emit("sendNewMsg", {
          userId:user._id, 
          msgSendToUserId:openChatId.current, 
          msg
        });
      }

    }
    
    //Confirming that a msg is sent & receiving the msges
    useEffect(()=>{

      //here, listem for the event "msgSent"
      if(socket.current){
        socket.current.on("msgSent", ({newMsg})=>{
          //This check basically means that, the user to whom we send the msg, we have that chat opened
          //we dont want to add the msgs to another persons chat in frontend :)
          if(newMsg.receiver === openChatId.current){
            setMessages(prev => [...prev, newMsg]);

            //setChats --> sets the latest msg(either from sender or reciver) in it (component below search bar) - inside chatList column
            setChats(prev => {
              const previousChat = prev.find(chat => chat.messagesWith === newMsg.receiver)
              previousChat.lastMessage = newMsg.msg
              previousChat.date=newMsg.date

              return [...prev];
            });
          }
        });

        // Here think that we are the receiver
        socket.current.on("newMsgReceived", async({newMsg})=>{

          let senderName;

          // If the chat of sender who send us msg is opened inside the browser
          if(newMsg.sender === openChatId.current){

            setMessages(prev => [...prev, newMsg])
            // The chat with the sender is opened in our browser
            // Find the prev chats and attacch the newMessage into that chat
            setChats(prev => {
              const previousChat = prev.find(chat => chat.messagesWith===newMsg.sender)
              previousChat.lastMessage = newMsg.msg;
              previousChat.date = newMsg.date;
              senderName = previousChat.name

              return [...prev];
            });
          }
          //If another users chat is opened
          else{
            //If chat is not opened inside the browser, we check if we had chat previously with this user
            const ifPreviouslyMessages = chats.filter(chat => chat.messagesWith === newMsg.sender).length > 0

            if(ifPreviouslyMessages){
              setChats(prev => {
                //Find the prev chat just and attach the newMessage into that chat like above we did 
                const previousChat = prev.find(chat => chat.messagesWith === newMsg.sender);
                previousChat.lastMessage = newMsg.msg;
                previousChat.date = newMsg.date;
                senderName = previousChat.name

                return [...prev];
              })
            }
            // No prev Chat with that user/sender --> create a chat now in chats --> just like chta, status, call in whatsapp
            else{
              const {name, profilePicUrl} = await getUserInfo(newMsg.sender);
              senderName = name

              const newChat = {
                messagesWith : newMsg.sender,
                name,
                profilePicUrl,
                lastMessage: newMsg.msg,
                date: newMsg.date
              };
              setChats(prev => [newChat, ...prev]); //newchat to the top --> just like whatsapp
            }
          }

          newMsgSound(senderName);    // This msg is called on this event newMsgRecieved
        });
      }
    }, [])


    //When the messages changes, this useEffect take part and autoScrollsToBottom
    useEffect(()=>{
      //when the state of the messages changes
      messages.length > 0 && scrollDivToBottom(divRef)

    }, [messages]);


    //This is to delete a msg --> just like dltForMe in whats app
    const deleteMsg = (messageId)=>{

      if(socket.current){
        socket.current.emit("deleteMsg", {userId: user._id, messagesWith: openChatId.current, messageId});

        //After deleting the Msg, also  make changes on the front end too By getting hold of prev values 
        socket.current.on("msgDeleted", ()=>{
          setMessages(prev => prev.filter(message => message._id !== messageId));
        })

      }

    };

    //Delete chat
    const deleteChat = async (messagesWith)=>{

      try {
        await axios.delete(`${baseUrl}/api/chats/${messagesWith}`, {headers:{Authorization:cookie.get('token')}});
        
        //After successfully deleting in the backend, Now reflect those changes in the frontend too by getting hold of prev obj
        setChats(prev => prev.filter(chat => chat.messagesWith !== messagesWith))

        //Push the user to the messages route
        router.push("/messages", undefined, {shallow: true});

      } catch (error) {
        alert("Error deleting chat")
      }
    }

  return (
    <>
      <Segment padded basic size="large" style={{marginTop :"5px"}}>
       
        <Header icon="home" content="Go Back!" onClick={() => router.push("/")} style={{cursor:"pointer"}} />
        <Divider hidden />
        
        <div style={{marginBottom : "10px"}}>
          <ChatListSearch chats={chats} setChats={setChats} />
        </div>

        {chats.length > 0 ? 
        <>
          <Grid stackable>
            <Grid.Column width={4}>
              <Comment.Group size="big" >
                <Segment raised style={{overflow: "auto", maHeight: "32rem"}} >
                    {chats.map( (chat,i) => (
                      <Chat
                        key={i} 
                        chat={chat}
                        setchats={setChats}
                        connectedUsers={connectedUsers}
                        deleteChat={deleteChat}
                        />
                    ))}
                </Segment>
              </Comment.Group>
            </Grid.Column>

            <Grid.Column width={12}>
              {router.query.message && (
                <>
                  <div style={{
                          overflow:"auto", 
                          overflowX:"hidden", 
                          maxHeight:"35rem", 
                          height:"35rem",
                          backgroundColor:"whitesmoke"
                          }} >

                          <div style={{position:"sticky", top:"0"}} >
                            <Banner bannerData={bannerData} />
                          </div>  

                          {messages.length>0 &&(
                            <>
                            {messages.map((message,i) => 
                              <Message 
                                divRef={divRef}
                                key={i} 
                                bannerProfilePic={bannerData.profilePicUrl}
                                message={message} 
                                user={user} 
                                deleteMsg={deleteMsg} 
                              />
                              )}

                            </>
                          )}
                  </div>
                  <MessageInputField sendMsg={sendMsg} />
                </>
              )}
            </Grid.Column>

          </Grid>
        </> : <NoMessages />}

      </Segment>
    </>
  )
}

//make req with get Initial Props
Messages.getInitialProps = async(ctx)=>{

    try {
        const {token} = parseCookies(ctx)

        const res = await axios.get(`${baseUrl}/api/chats`, {headers : {Authorization : token}})

        return {chatsData : res.data}

    } catch (error) {
        return {errorLoading : true}
    }
}


export default Messages
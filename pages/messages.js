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

function Messages({chatsData, user}) {

    const [chats, setChats] = useState(chatsData)
    const router = useRouter();   //intialize the hook
    const [connectedUsers, setConnectedUsers] = useState([])  //we can use this state to check if a user is online or not

    const [messages, setMessages] = useState([])
    const [bannerData, setBannerData] = useState({name:"", profilePicUrl:""});
   
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
        //socket.emit(event_name, object) 
        // socket.current.emit("helloWorld", {name:"Manjunadh", age:"21"})   //we can create and fire custom events using this function
        // socket.current.on("dataReceived", ({msg})=>{
        //   console.log(msg)
        // })
        //
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

      return ()=>{
        if(socket.current){
          //remove the user from the server 
          socket.current.emit("disconnect")
          socket.current.off()  //this will remove this event listener
        }
      }

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
          //console.log(chat)
          setMessages(chat.messages)
          setBannerData({name:chat.messagesWith.name, profilePicUrl:chat.messagesWith.profilePicUrl})

          openChatId.current = chat.messagesWith._id  //query string = user id with whom we are chatting
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
            })
          }

        })
      }

    }, [])

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
                                key={i} 
                                bannerProfilePic={bannerData.profilePicUrl}
                                message={message} 
                                user={user} 
                                setMessages={setMessages}
                                messagesWith={openChatId.current} 
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
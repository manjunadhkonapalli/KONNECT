import React, {useEffect, useState} from 'react'
import {List, Image, Search} from "semantic-ui-react"
import axios from "axios"
import cookie from "js-cookie"
import {useRouter} from "next/router"
import baseUrl from "../../utils/baseUrl"
let cancel;    //we will cancel any pending requests

function ChatListSearch({chats, setChats}) {

  const [text, setText] = useState("");     //for searching text
  const [loading, setLoading] = useState(false);    //animate loading while searching in DB
  const [results, setResults] = useState([]);     //for search results from DB
  const router = useRouter()

  async function handleChange(e){

    //destructure out values
    const {value} = e.target

    //1 bug found --> hhandle chnage func shouid`nt be called if characters are less than 1 --> but its being called--> so thats why we re stuck in infinite Loading
    if(value.length ===0) return setText(value);

    //1 more bug. when user enters " " white space -> infinite loading, unresponsive layout
    if(value.trim().length === 0) return; //trim will remove white spaces in a string(either in start, or at end) --> " Manjunadh " -> "Manjunadh"


    setText(value)
    setLoading(true)

    try {
      cancel && cancel()
      //just like we did in our signup page
      const CancelToken = axios.CancelToken
      const token = cookie.get("token")

      const res = await axios.get(`${baseUrl}/api/search/${value}`, {
        headers:{Authorization:token},
        cancelToken: new CancelToken(canceler=>{
          cancel = canceler;
        })
      });

      if(res.data.length===0){  //when datalength is 0 but results length != 0 this might be the case :)
        //even though when there are no results from the backend, the prev state was still populated and it was showing some results on the resultRenderer
        results.length > 0 && setResults([])
        return setLoading(false);
      } 
      //if results available
      setResults(res.data);

    } catch (error) {
      //alert("Error Searching")
      console.log("Error Searching")
    }

    setLoading(false);
  }

  //1 bug found --> we re stuck in infinite Loading when characters are less than 1
  useEffect(()=>{
    if(text.length === 0 && loading)  setLoading(false);
  }, [text])    //renders everytime the text state changes

  async function addChat(result){

    const alreadyInChat = chats.length>0 && chats.filter(chat=>chat.messagesWith === result._id).length > 0;

    if(alreadyInChat){
      //push the user to thatchat
      return router.push(`/messages?message=${result._id}`)
    }
    else{
      const newChat = {
        messagesWith : result._id,
        name : result.name,
        profilePicUrl : result.profilePicUrl,
        lastMessage : "",
        date : Date.now()
      }
      
      setChats(prev => [newChat, ...prev]);
      return router.push(`/messages?message=${result._id}`)
    }

  }

  return (
    <Search 
      onBlur={()=>{
        results.length>0 && setResults([])
        loading && setLoading(false);
        setText("");
      }} 
      loading={loading} 
      value={text} 
      resultRenderer={ResultRenderer} 
      results={results} 
      onSearchChange={handleChange}
      minCharacters = {1}
      onResultSelect={(e, data)=>{
        addChat(data.result)
      }}
     />
  )
}

function ResultRenderer({_id, profilePicUrl, name}){
  
  return (
  <List key={_id}>
    <List.Item>
      <Image src={profilePicUrl} alt="ProfilePic" avatar />
      <List.Content header={name} as="a" />
    </List.Item>
  </List>
)}

export default ChatListSearch
import React, {useState, useRef} from 'react'
import {Form, Button, Image, Divider, Message, Icon} from "semantic-ui-react"
import uploadPic from "../../utils/uploadPicToCloudinary"
import {submitNewPost} from "../../utils/postActions"

function CreatePost({user, setPosts}) { //user is the state of the user who logged in

  const [newPost, setNewPost] = useState({text:"", location:"" }) //adding default values , that are not mandatory in schema 
  const [loading, setLoading] = useState(false)
  const inputRef = useRef()

  const [error, setError] = useState(null)
  const [highlighted, setHighlighted] = useState(false)   //for uploading the image, we put div here
  const [media, setMedia] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)

  function handleChange(e){
    const {name, value, files} = e.target

    if(name === "media"){
      setMedia(files[0])
        setMediaPreview(URL.createObjectURL(files[0]));
      return;
    }

    setNewPost(prev=>({...prev, [name] : value}));

  }

  async function handleSubmit(e){
    e.preventDefault()
    setLoading(true)

    let picUrl;
    //console.log(media)
    if(media!=null){
      picUrl = await uploadPic(media)
      if(!picUrl){
        setLoading(false)
        return setError("Error Uploading Image")
      }
    }

    //after this check, we will call submitPost func
    await submitNewPost(user,newPost.text, newPost.location, picUrl, setPosts, setNewPost, setError)

    //after uplading the inputs to DB -> kind of refreshing the varaibles :)
    setMedia(null);
    setMediaPreview(null)
    setLoading(false)

  };

  function addStyles(){
    return{
      textAlign:"center", 
      height:"150px",
      width:"150px",
      border:"dotted",
      paddingTop: media===null && "60px",   //only is media is null then we`re gng to add paddingTop
      cursor:"pointer",
      borderColor:highlighted ? "green" : "black"
      }
  }

  return (
    <>
      <Form error={error!==null} onSubmit={handleSubmit} >
        <Message error onDismiss={()=>setError(null)} content={error} header="Oops!" />
        
        <Form.Group>
          <Image src={user.profilePicUrl} circular avatar inline />
          <Form.TextArea 
          placeholder="Whats Happening" 
          name="text" 
          value={newPost.text} 
          onChange={handleChange}
            rows={4}
            width={14}
          />
        </Form.Group>

        <Form.Group>
          <Form.Input 
          label="Add Location"
          name="location" 
          placeholder="Want to add Location?"
          value={newPost.location} 
          onChange={handleChange}
          icon="map marker alternate"
          />
        </Form.Group>

        <input 
        ref={inputRef} 
        onChange={handleChange} 
        name="media"
        style={{display:"none"}}
        type="file"
        accept="image/*"
        />

        <div 
        style={addStyles()}
        onDragOver={e=>{
          e.preventDefault()
          setHighlighted(true)
        }}

        onClick={()=>inputRef.current.click()}

        onDragLeave={e=>{
          e.preventDefault()
          setHighlighted(false)
        }}
        onDrop={e=>{
          e.preventDefault()
          setHighlighted(true)
          //we get file list --> so convert it to an array
          const droppedFile = Array.from(e.dataTransfer.files)

          setMedia(droppedFile[0])  //contains for image id to store in DB
          console.log(droppedFile[0])
          setMediaPreview(URL.createObjectURL(droppedFile[0]))  //this is actually converts that file into previewable Url-> url is locally stored in browser

          
        }}

        >

          {media===null ? (
            <Icon name="plus" size="big"/>
          ):( 
            <>
              <Image style={{height:"150px", width:"150px"}} src={mediaPreview} alt="PostImage" centered size="medium" />
            </>)}

        </div>
        <Divider hidden />

        <Button circular disabled={newPost.text==="" || loading} content={<strong>Post</strong>} style={{backgroundColor:"#1DA1F2", color:"white"}} icon="send" loading={loading} />

      </Form>
      <Divider />
    </>
  )
}

export default CreatePost 
import React, {useState, useEffect, useRef} from "react"
import {Form, Message, Segment, TextArea, Button, Divider} from "semantic-ui-react"
import {HeaderMessage, FooterMessage} from "../components/Common/WelcomeMessage"
import CommonInputs from "../components/Common/CommonInputs";
import ImageDropDiv from "../components/Common/ImageDropDiv";
import axios from "axios"
import baseUrl from "../utils/baseUrl"
import {registerUser} from "../utils/authUser" 
import uploadPic from "../utils/uploadPicToCloudinary";

const regexUserName = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;
let cancel;

function Signup() {
  //State to create our user
  const[user, setUser] = useState({
    name : "",
    email : "",
    password : "",
    bio : "",
    facebook : "",
    youtube : "",
    twitter : "",
    linkedin : "",
  });

  //Destructure out our Object --> {}
  const{name, email, password, bio} = user;

  //another boolean state to show the Social links when button is clicked (conditional rendering)
  const [showSocialLinks, setShowSocialLinks] = useState(false)

  //Boolean State to show the password when clicked
  const [showPassword, setShowPassword] = useState(false) 

  //State to show any error in case
  const [errorMsg, setErrorMsg] = useState(null)

   //a state for form loading
   const [formLoading, setFormLoading] = useState(false)

  //to use with useEffect
  const [submitDisabled, setSubmitDisabled] = useState(true)



  //State to set username --> we are going to maintain a separate state for our username, bcz, while usertypes, i want to give the feedback that username is available or not
  const [username, setUsername] = useState("")

  //State for loading to check whether username available or not --> we get loader when user types in something
  const [usernameLoading, setUsernameLoading] = useState(false)

  //Boolean state for username available or not --> if available, show tick sign, if not, show cross sign
  const [usernameAvailable, setUsernameAvailable] = useState(false)

  //Extra feature --> confirming, matching the password
  const [confirmPassword, setConfirmPassword] = useState("")
  const [matchPassword, setMatchPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);



  //states for Image upload section
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [highlighted, setHighlighted] = useState(false);  //to maintain greenline
  const inputRef = useRef();

  //to handle the onSubmit
  async function handleSubmit(event){
    event.preventDefault();   //This prevents auto refreshing of the form after clicking submit --> which is a bydefault behaviour of form
    setFormLoading(true)

    let profilePicUrl;
    if(media !== null){   //the state in which we are storing our image url
      profilePicUrl = await uploadPic(media);
    }

    //media not null and no profile pic url -> there is an error in uploading the img -> bcz the profilepicurl is still undefined
    if(media !== null && !profilePicUrl){
      setFormLoading(false)
      return setErrorMsg("Error uploading image")
    }


    //Now call the registerUser function
    await registerUser(user, profilePicUrl, setErrorMsg, setFormLoading)

  };

  function handleChange(event){
    //destructure out the values that we receive from event object
    const {name, value, files} = event.target   //files we receive from event.target here is automatically an array. No need to convert that

    if(name==="media"){
      setMedia(files[0])
      setMediaPreview(URL.createObjectURL(files[0]))  //URL.createObjectURL -->basically creates the url link so that the browser can fetch the image from that link -- but that object url is not available on the internet. only available locally --It isstored inside the browser. If user refeshes the page or moves to another page (login to sigup) , the browser autmtcly clears off this Object Url -- Object URLs are mainly used for creating previews. for ex: we can also create previews fro videos, pdf files 
      //setMediaPreview(window.URL.createObjectURL(new Blob(files[0], {type:"image/"})))
    }

    setUser(function(prev){
      return {...prev, [name]:value}})  //Spread out the prev, and on extra, add current events name, value attributes
  }


/* If you don't want to have this useEffect, you can handle it like this
 on the button for submit
 <Button disabled={ name==="" || password===""  || bio==="" || email==="" || !usernameAvailable   } /> */

  useEffect(()=>{
    //Creating an object of values with the below given object, Object.values converts an object into an array, then using every method, we are checking every item inside this array, which is created with this object.values, has a value or not
    //if there is even 1 field inside this object which doesnt have a value, we are gonna set submit buttom disabled
    const isUser = Object.values({name, email, password, bio}).every((item)=>{return Boolean(item)})
    //if all the fields has value then returns true
    isUser ? setSubmitDisabled(false) : setSubmitDisabled(true)

  }, [user])

  async function checkUsername(){
    setUsernameLoading(true)    //convincing audience that username search is in progress int the backend
    try{
      //first we check if cancel is there -> Basically we are creating a cancel token to cancel a requst which is pending, and we are making new reqeust
      cancel && cancel();
      const CancelToken = axios.CancelToken;

      //Make request to the backend to check if username alredy exist
      //await can only be used inside async functions -- //we re gonna pass out username to backend and get the response stored in res
      //while the req is being sent, along with, a cancelToken will also get assigned to cancel variable through canceler --> so next time when this fucc excts, cancel check happens
      const res = await axios.get(`${baseUrl}/api/signup/${username}`, {
        cancelToken: new CancelToken(canceler=>{
          cancel = canceler;
      })
    });

    //this will fix that bug which --> username checking an above error not going dynamically
      if(errorMsg !== null)setErrorMsg(null);

      if(res.data === "Available"){  //res.status(401).send("Available") --> string is stored in data field
        setUsernameAvailable(true);
        setUser(prev=>{ 
          return {...prev, username}  //spread all the prev data and append this username to the USer state
        })
      }

    }catch(error){
      setErrorMsg("Username Not available");
      setUsernameAvailable(false);
    }
    
    setUsernameLoading(false)
  };

//on every change in username, call this func and do some side effects of that change --> useEffect
  useEffect(()=>{
    (username==="")?setUsernameAvailable(false) : checkUsername()
  }, [username])


  return (
    <>
      <HeaderMessage />
      <Form loading={formLoading} error={errorMsg!==null} onSubmit={handleSubmit}>
        {/*This msg will only be available or seen by the user when there is an error in the form*/}
        <Message 
          error 
          header="Oops!" 
          content={errorMsg} 
          onDismiss={()=>setErrorMsg(null)}   /*A message that the user can choose to hide. */
        />      

        <Segment>
          <ImageDropDiv 
            setMedia={setMedia} 
            mediaPreview={mediaPreview}
            setMediaPreview={setMediaPreview}
            highlighted={highlighted}
            setHighlighted={setHighlighted}
            inputRef={inputRef}
            handleChange={handleChange}

          />
          <Form.Input label="Name" placeholder="Name" name="name" value={name} onChange={handleChange} fluid icon="user" iconPosition="left" required/>
          <Form.Input label="Email" placeholder="Email" name="email" value={email} onChange={handleChange} fluid icon="mail" iconPosition="left" type="email" required/>
          <Form.Input label="Password" placeholder="Password" name="password" value={password} onChange={handleChange} fluid 
            icon= {{
              name:"eye",
              circular : false,
              link : true,
              onClick : ()=>setShowPassword(!showPassword)  //Very very Imp, Good point
            }} 
            //iconPosition="right" 
            type={showPassword?"text":"password"} 
            required 
            />

    {/* implemented this using extra effort */}
          <Form.Input label="Confirm Password" placeholder="re-enter password"  fluid
            onChange={e=>{
              const value = e.target.value;
              setConfirmPassword(value)
              if(value === password){
                setMatchPassword(true)
              }
              else
                setMatchPassword(false)
            }}
            /*icon= {{
              name :"eye",
              circular : false,
              link : true,
              onClick : ()=>setShowConfirmPassword(!showConfirmPassword)  //Very very Imp, Good point
            }} */
            icon={matchPassword?"check":"close"}
            //iconPosition="right" 
            type={showPassword?"text":"password"} 
            required 
          />

          <Form.Input 
            loading={usernameLoading} 
            error={!usernameAvailable} 
            label="Username" 
            placeholder="Username" 
            value={username} 
            onChange={e=>{
              setUsername(e.target.value)
               //every regularExp has a test method on it. If it passes the test set usernameAvailable to true or else set it to false
              if(regexUserName.test(e.target.value)) 
                setUsernameAvailable(true)
              else 
                setUsernameAvailable(false)
            }} 
            fluid 
            icon={usernameAvailable?"check":"close"} 
            //iconPosition="left" 
            required 
            />

          <CommonInputs 
            user={user} 
            showSocialLinks={showSocialLinks} 
            setShowSocailLinks={setShowSocialLinks} 
            handleChange={handleChange} 
          />

          <Button 
            content="Signup" 
            type="submit" 
            color="orange" 
            disabled={submitDisabled || !usernameAvailable} />


        </Segment>
      </Form>


      <FooterMessage />
    </>
  );
}

export default Signup
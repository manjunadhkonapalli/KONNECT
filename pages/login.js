import React, {useState, useEffect, useRef} from "react"
import {Form, Message, Segment, TextArea, Button, Divider} from "semantic-ui-react"
import {HeaderMessage, FooterMessage} from "../components/Common/WelcomeMessage"
import { LoginUser } from "../utils/authUser";
import cookie from "js-cookie"


function Login() {
  //State to create our user
  const[user, setUser] = useState({
    email : "",
    password : "",
  });

  //Destructure out our Object --> {}
  const{email, password} = user;

  //Boolean State to show the password when clicked
  const [showPassword, setShowPassword] = useState(false) 

  //State to show any error in case
  const [errorMsg, setErrorMsg] = useState(null)

   //a state for form loading
   const [formLoading, setFormLoading] = useState(false)

  //to use with useEffect
  const [submitDisabled, setSubmitDisabled] = useState(true)

  function handleChange(event){
    //destructure out the values that we receive from event object
    const {name, value} = event.target   //files we receive from event.target here is automatically an array. No need to convert that

    setUser(function(prev){
      return {...prev, [name]:value}})  //Spread out the prev, and on extra, add current events name, value attributes
  }

  useEffect(()=>{
    //Creating an object of values with the below given object, Object.values converts an object into an array, then using every method, we are checking every item inside this array, which is created with this object.values, has a value or not
    //if there is even 1 field inside this object which doesnt have a value, we are gonna set submit buttom disabled
    const isUser = Object.values({ email, password}).every((item)=>{return Boolean(item)})
    //if all the fields has value then returns true
    isUser ? setSubmitDisabled(false) : setSubmitDisabled(true)

  }, [user])

  async function handleSubmit(e){
    e.preventDefault()

    await LoginUser(user, setErrorMsg, setFormLoading)
  }

  //Autofilling email once user loggs out through generated email cookie
  useEffect(()=>{

    document.title ="Welcome back !"
    const userEmail = cookie.get("userEmail")

    if(userEmail) setUser(prev=>{     //user is state in login page containing name, email fields -- spreading the prev values & setting the email 
      return {...prev, email:userEmail}
    })
    
  },[])   //this will happend on only first render --- on mount(putting elmts into DOM)
  

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
          <Form.Input label="Email" placeholder="Email" name="email" value={email} onChange={handleChange} fluid icon="mail" iconPosition="left" type="email" required/>
          <Form.Input label="Password" placeholder="Password" name="password" value={password} onChange={handleChange} fluid 
            icon= {{
              name:"eye",
              circular : true,
              link : true,
              onClick : ()=>setShowPassword(!showPassword)  //Very very Imp, Good point
            }} 
            iconPosition="left" 
            type={showPassword?"text":"password"} 
            required 
          />

          <Button 
            content="Login" 
            type="submit" 
            color="orange"
            disabled={submitDisabled} />

        </Segment>
      </Form>   
      <FooterMessage />
    </>
  );
}

export default Login;
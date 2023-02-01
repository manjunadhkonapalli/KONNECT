import React, {useState, useRef} from 'react'
import {Form, Button, Divider, Message} from "semantic-ui-react"
import uploadPic from "../../utils/uploadPicToCloudinary"
import ImageDropDiv from "../Common/ImageDropDiv"
import CommonInputs from "../Common/CommonInputs"
import {profileUpdate} from "../../utils/profileActions"

function UpdateProfile({Profile}) {

    //after loaidng the page we need to set the pre information --> so we use state
    const [profile, setProfile] = useState({
        profilePicUrl : Profile.user.profilePicUrl,
        bio : Profile.bio,
        facebook : (Profile.social && Profile.social.facebook) || "",
        linkedin : (Profile.social &&Profile.social.linkedin) || "",
        twitter : (Profile.social && Profile.social.twitter) || "",
        youtube : (Profile.social && Profile.social.youtube) || ""
    });

    const[media, setMedia] = useState(null);     //for image
    const[mediaPreview, setMediaPreview] = useState(null);
    const[errorMsg, setErrorMsg] = useState(null);      //ifany errors in uploading the pics, this will tell us
    const[loading, setLoading] = useState(false);   //loadinng indicator, while form is submitting

    //state to show Social media links
    const[showSocialLinks, setShowSocialLinks] = useState(false);
    const[highlighted, setHighlighted] = useState(false);
    const inputRef = useRef();      //Not maintaing a inputbutton to input img --> But when user clicks on image, we can give input

    function handleChange(e){
        const {name, value, files} = e.target
        if(name==="media"){
            setMedia(files[0])
            setMediaPreview(URL.createObjectURL(files[0]));
        }
        setProfile(prev => ({...prev, [name]: value}));
        
    }



  return (
    <>
        <Form 
        loading={loading} 
        error={errorMsg!==null} 
        onSubmit={async (e)=>{
            e.preventDefault();

            setLoading(true)

            let profilePicUrl;
            if(media !== null){
                profilePicUrl = await uploadPic(media)
            }

            if(media !== null && !profilePicUrl){
                setLoading(false)
                return setErrorMsg("Error Uploading Image")
            }

            await profileUpdate(profile, setLoading, setErrorMsg, profilePicUrl);
        }}>
        {/*This msg will be shown only when there is any error */}
        <Message 
        error 
        onDissmiss={()=>setErrorMsg(null)} 
        content={errorMsg} 
        header="Oops!"
        attached
        />
        <ImageDropDiv  
        setMedia={setMedia}
        mediaPreview={mediaPreview}
        setMediaPreview={setMediaPreview}
        highlighted={highlighted}
        setHighlighted={setHighlighted}
        inputRef={inputRef}
        handleChange={handleChange}
        profilePicUrl={profile.profilePicUrl}
        />

        <CommonInputs
        user={profile}
        handleChange={handleChange}
        showSocialLinks={showSocialLinks}
        setShowSocailLinks={setShowSocialLinks}
         />

        <Divider hidden/>

         <Button 
         color="blue" 
         disabled={profile.bio==="" || loading}
         icon="pencil alternate"
         content="Submit"
         type="submit"
        />
        </Form>
    </>
  )
}

export default UpdateProfile
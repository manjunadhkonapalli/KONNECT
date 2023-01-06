import React from 'react'
import {Form, Message, Segment, TextArea, Button, Divider, FormDropdown, FormField} from "semantic-ui-react"

//pass in the user state from signup page as prop and destructure out bio from it, 
function CommonInputs({
    user:{bio, facebook, youtube, twitter, linkedin}, 
    handleChange,
    showSocialLinks, setShowSocailLinks
}) {
  return (
    <>
        <Form.Field 
            required 
            control={TextArea} 
            label="Bio"
            name="bio" 
            value={bio} 
            onChange={handleChange} 
            placeholder="bio" 
        />
        <Button 
            content="Add Social Links" 
            color="olive" 
            icon="at" 
            type="button" 
            onClick={()=>{setShowSocailLinks(!showSocialLinks)}}
        />
        <Divider />
        {showSocialLinks && <>
            <Message header="Social Media Links Are Optional" icon="attention" info />

            <Form.Input 
                name="facebook"
                value={facebook} 
                icon="facebook" 
                iconPosition="left" 
                onChange={handleChange}
            />
            <Form.Input 
                name="twitter"
                value={twitter} 
                icon="twitter" 
                iconPosition="left" 
                onChange={handleChange}
            />
            <Form.Input 
                name="youtube"
                value={youtube} 
                icon="youtube" 
                iconPosition="left" 
                onChange={handleChange}
            />
            <Form.Input 
                name="linkedin"
                value={linkedin} 
                icon="linkedin" 
                iconPosition="left" 
                onChange={handleChange}
            />
        </>}
    </>
  )
}

export default CommonInputs
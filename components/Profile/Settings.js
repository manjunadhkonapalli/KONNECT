import React, {useState, useEffect, useRef} from 'react'
import {Form, Button, Divider, Message, List, Checkbox} from "semantic-ui-react"
import {passwordUpdate, toggleMessagePopup} from "../../utils/profileActions"

function Settings({newMessagePopup}) {

    const [showUpdatePassword, setShowUpdatePassword] = useState(false);    //this will control the visibility of update password tab
    const [success, setSuccess] = useState(false);  //if password/any settings, updated successfully, we show that msg through this state

    const [showMessageSettings, setShowMessageSettings] = useState(false);
    const [popupSetting, setPopupSetting] = useState(newMessagePopup)

    const isFirstRun = useRef(true);

    useEffect(()=>{
        success & setTimeout(()=>setSuccess(false), 3000);  //if success is true, we change it after 3sec(the success msg will go)
    }, [success])   //this is render the page everytime when success changes

    useEffect(()=>{
        if(isFirstRun.current){
            isFirstRun.current = false;
            return;
        }
    }, [popupSetting])

  return (
    <>
        {success && (
        <>
            <Message icon="check circle" header="Updates Successfully" success />
            <Divider hidden />
        </>
        )}

        <List size="large" animated>
            <List.Item>
                <List.Icon name="user secret" size="large" verticalAlign="middle" />
                <List.Content>
                    <List.Header 
                    as="a" 
                    onClick={()=>setShowUpdatePassword(!showUpdatePassword)} 
                    content="Update Password" />
                </List.Content>

                {showUpdatePassword && 
                <UpdatePassword 
                    setSuccess={setSuccess} 
//{/*we are passing this state to compnt, so that we can toggle the state from that component too  */}
                    setShowUpdatePassword={setShowUpdatePassword}
                />}
            </List.Item>
            <Divider hidden />

            <List.Item>
                <List.Icon 
                name="paper plane outline"
                size="large" 
                verticleAlign="middle" 
                />

                <List.Content>
                    <List.Header 
                    onClick={()=>setShowMessageSettings(!showMessageSettings)} 
                    as ="a" 
                    content="Show New Message Popup?"
                    />
                </List.Content>
                {showMessageSettings && (
                    <div style={{marginTop:"10px"}} >
                    Control whether a Popup should appear when there is a new Message?
                    <br />
                    <Checkbox checked={popupSetting} toggle onChange={()=>toggleMessagePopup(popupSetting, setPopupSetting, setSuccess)}  />
                </div>
                )}
               
            </List.Item>
        </List>
    </>
  )
}

function UpdatePassword({setSuccess, setShowUpdatePassword}){
    
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null)
    const [userPasswords, setUserPasswords] = useState({
        currentPassword : "",
        newPassword : ""
    });

    const [showTypedPassword, setShowTypesPassword] = useState({
        field1 : false,
        field2 : false
    });

    //destructure the preperties for easy access  
    const {currentPassword, newPassword} = userPasswords;
    const {field1, field2} = showTypedPassword

    function handleChange(e){
        const {name, value} = e.target
        setUserPasswords(prev => ({...prev, [name] :value}));
    };

    useEffect(()=>{
        errorMsg!==null && setTimeout(()=>setErrorMsg(null), 5000)
    }, [errorMsg])

    return(
        <>
            <Form 
            error={errorMsg!==null} 
            loading={loading} 
            onSubmit={async e =>{ 
                e.preventDefault()
                setLoading(true)

                await passwordUpdate(setSuccess, userPasswords);
                setLoading(false)

                setShowUpdatePassword(false);

                }}>

                <List.List>
                    <List.Item>
                        <Form.Input 
                        fluid icon={{
                            name:"eye", 
                            circular:true,
                            link: true,
                            onClick: ()=>setShowTypesPassword(prev => ({...prev, field1: !field1}))
                            }} 
                            type={field1 ? "text" : "password"}
                            iconPosition="left"
                            label="Current Password"
                            placeholder="Enter Current Passsword"
                            name="currentPassword"
                            onChange={handleChange}
                            value={currentPassword}
                            />

                        <Form.Input 
                        fluid icon={{
                            name:"eye", 
                            circular:true,
                            link: true,
                            onClick: ()=>setShowTypesPassword(prev => ({...prev, field2: !field2}))
                            }} 
                            type={field2 ? "text" : "password"}
                            iconPosition="left"
                            label="New Password"
                            placeholder="Enter new Passsword"
                            name="newPassword"
                            onChange={handleChange}
                            value={newPassword}
                            />

                            <Button 
                            disabled={loading || newPassword==="" || currentPassword===""}
                            compact
                            icon="configure"
                            type="submit"
                            color="teal"
                            content="Confirm"
                             />

                            <Button 
                            disabled={loading}
                            compact
                            icon="cancel"
                            color="grey"
                            content="Cancel"
                            onClick={()=>setShowUpdatePassword(false)}
                             />
            {/*If any error is there, this msg compnt will show */}
                            <Message error icon="meh" header="Oops!" content={errorMsg} />
                    </List.Item>
                </List.List>
            </Form>
            <Divider hidden/>
        </>
    )

}

export default Settings
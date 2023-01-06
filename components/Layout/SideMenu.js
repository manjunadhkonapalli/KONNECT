import React from 'react'
import {List, Icon, Divider} from "semantic-ui-react"
import Link from "next/link"
import {useRouter} from "next/router"
import {logoutUser} from "../../utils/authUser"

function SideMenu({user: {unreadNotification, email, unreadMessage, username}}) {

//initialize useRouter Hook
const router = useRouter()

//a funct to tell whether sidemenu is active or not
function isActive(route){
    return router.pathname===route;
}


  return (
    <>
        <List style={{paddingTop:"1rem" }} size="big" verticalAlign="middle" selection >
            <Link href="/" >
                <List.Item active={isActive("/")} >
                    <Icon name="home" size="large" color={isActive("/") && "teal"} />
                    <List.Content>
                        <List.Header content="Home" />
                    </List.Content>
                </List.Item>
            </Link>
            
            <br />
            
            <Link href="/messages" >
                <List.Item active={isActive("/messages")} >
                    <Icon name={unreadMessage?"hand point right":"mail outline"} size="large" color={(isActive("/messages") && "teal") || (unreadMessage && "orange")} />
                    <List.Content>
                        <List.Header content="Messages" />
                    </List.Content>
                </List.Item>
            </Link>

            <br />

            <Link href="/notifications" >
                <List.Item active={isActive("/notifications")} >
                    <Icon name={unreadNotification?"hand point right":"bell outline"} size="large" color={(isActive("/messages") && "teal") || (unreadNotification && "orange")} />
                    <List.Content>
                        <List.Header content="Notifications" />
                    </List.Content>
                </List.Item>
            </Link>

            <br />

        {/* we will set router of profile page as / +  our username */}
            <Link href={`/${username}`} >     
                <List.Item active={(router.query.username===username)} >
                    <Icon name="user" size="large" color={router.query.username===username && "teal"}/>
                    <List.Content>
                        <List.Header content="Account" />
                    </List.Content>
                </List.Item>
            </Link>

            <br />

            <List.Item onClick={()=>logoutUser(email)} >
                <Icon name="log out" size="large" />
                <List.Content>
                    <List.Header content="Logout" />
                </List.Content>
            </List.Item>

            <Divider />

        </List>
    </>
  )
}

//If we would be using react router...
// <Route exact path={`/:id`} component={Profile} />
//match.params.id

export default SideMenu
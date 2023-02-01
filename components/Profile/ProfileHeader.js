import React, {useState} from 'react'
import { Segment, Grid, Image, Divider, Header,Button, List  } from 'semantic-ui-react'
import Link from "next/link"
import {followUser, unfollowUser} from "../../utils/profileActions"

function ProfileHeader({profile, ownAccount, loggedUserFollowStats, setUserFollowStats}) {
  
    const [loading, setLoading] = useState(false)

    //filtering over the following array, checking if following.user === profile.user (opened profile user).
    //Basically w are checking if we are alresday following the user.
    const isFollowing = 
    loggedUserFollowStats.following.length > 0 && 
    loggedUserFollowStats.following.filter(
        following => following.user === profile.user._id)
        .length > 0
  
    return (
    <>
        <Segment color="red">
            <Grid stackable>
                <Grid.Column width={11}>
                    <Grid.Row>
                        <Header 
                        as ="h2" 
                        content={profile.user.name} 
                        style={{marginTop: "5px"}} 
                        />
                    </Grid.Row>

                    <Grid.Row stretched centered>
                        {profile.bio}
                        <Divider hidden />
                    </Grid.Row>

                    <Grid.Row>
                        {profile.social ? <>
                            <List>
                                <List.Item>
                                    <List.Icon name="mail" color="" />
                                    <List.Content content={profile.user.email} />
                                </List.Item>

                                {profile.social.facebook && 
                                <List.Item>
                                    <List.Icon name="facebook" color="blue"/>
                                    <List.Content content={<Link href={profile.social.facebook}>Facebook</Link>} style={{color:"blue"}} />
                                </List.Item>}

                                {profile.social.linkedin && 
                                <List.Item>
                                    <List.Icon name="linkedin" color="blue"/>
                                    <List.Content content={<Link href={profile.social.linkedin}> LinkedIn</Link>} style={{color:"blue"}} />
                                </List.Item>}

                                {profile.social.youtube && 
                                <List.Item>
                                    <List.Icon name="youtube" color="red"/>
                                    <List.Content content={<Link href={profile.social.youtube}>Youtube</Link>} style={{color:"blue"}} />
                                </List.Item>}
                                {profile.social.twitter && 
                                <List.Item>
                                    <List.Icon name="twitter" color="blue"/>
                                    <List.Content content={<Link href={profile.social.twitter}>Twitter</Link>} style={{color:"blue"}} />
                                </List.Item>}
                            </List>
                        </> : <>No Social Media Links</>}
                    </Grid.Row>
                </Grid.Column>

                <Grid.Column width={5} stretched style={{textAligh:"center"}} >
                    <Grid.Row>
                        <Image src={profile.user.profilePicUrl} avatar  size="large" />
                    </Grid.Row>
                    <br />
                    {/*if not viewing our own profile, we will show option of follow / following */}
                    {!ownAccount && 
                    <Button 
                        compact 
                        loading={loading} 
                        disabled={loading} 
                        content={isFollowing ? "Following" : "Follow"}  
                        icon={isFollowing?"check circle" : "add user"}
                        color={isFollowing?"instagram" : "twitter"}
                        onClick={async()=>{
                            setLoading(true);
                            isFollowing ? await unfollowUser(profile.user._id, setUserFollowStats) :
                            await followUser(profile.user._id, setUserFollowStats);

                            setLoading(false)
                        }}
                    />}

                </Grid.Column>

            </Grid>
        </Segment>
    </>
  )
}

export default ProfileHeader
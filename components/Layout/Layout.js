import React, { Children, Component, createRef } from "react";
import HeadTags from "./HeadTags";
import Navbar from "./Navbar";
import { Container, Visibility, Grid, Sticky, Ref, Divider, Segment, GridColumn } from "semantic-ui-react";
import nProgress from "nprogress";
//always remember, deafault packages names start with lower case --> not next/Router. its next/router
import Router, {useRouter} from "next/router" 
import SideMenu from "./SideMenu";
import Search from "./Search";
import MobileHeader from "./MobileHeader";
import {createMedia} from "@artsy/fresnel";

//We have to pass the breakpoints of our app --> like mediaqueries in CSS
const AppMedia = createMedia({
  breakpoints:{
    zero:0,
    mobile:549,
    tablet:850,
    computer:1080
  }
});

const mediaStyles = AppMedia.createMediaStyle()
const {Media, MediaContextProvider} = AppMedia


//destruture prop as an object
function Layout({children, user}) {     //layouts children is component -- cmpnt is an active page

  //console.log({children})
  const contextRef = createRef()

  const router = useRouter()
  const messagesRoute = router.pathname === "/messages"

  Router.onRouteChangeStart =()=> nProgress.start()     //on routechange start, start animating the progress bar
  Router.onRouteChangeComplete =  ()=> nProgress.done()     //on routechange end, complete animating the progress bar
  Router.OnRouteChangeError = ()=>nProgress.done()      //if there is any error on changing the route

  return (
    <>  
      <HeadTags />
      {/*We will show this layout when the user is loggedin only*/}
      {user ? (
        <>
          <style>{mediaStyles}</style>

          <MediaContextProvider>
            <div style={{marginLeft:"1rem", marginRight:"1rem"}}>
              <Media greaterThanOrEqual="computer">
                <Ref  innerRef={contextRef}>
                  <Grid>
                    {!messagesRoute ? (<> 
                    <GridColumn floated="left" width={2}>
                      <Sticky context={contextRef} >
                        <SideMenu user={user} pc />
                      </Sticky>
                    </GridColumn>

                    <GridColumn width={10}>
                      <Visibility context={contextRef} >  {/*scrollable -->It provides some set of callbacks when content appears on the viewport*/}
                        {children}    {/*layouts children is component --> compnt is an active page --> so which ever the page calls */}
                      </Visibility>
                    </GridColumn>

                    <GridColumn  floated="left" width={4}>
                      <Sticky context={contextRef} >
                        <Segment basic>
                          <Search />
                        </Segment>
                      </Sticky>
                    </GridColumn>
                    </>
                    ) : ( 
                    <>
                      <Grid.Column floated="left" width={1} />
                      <Grid.Column width={15}>
                        {children}
                      </Grid.Column>

                    </>)}

                  </Grid>
                </Ref>
              </Media>

              <Media between={['tablet', 'computer']}> {/*computer value1080 not included */}
                <Ref  innerRef={contextRef}>
                  <Grid>
                    {!messagesRoute ? (<> 
                      <GridColumn floated="left" width={1}>
                      <Sticky context={contextRef} >
                        <SideMenu user={user} pc={false}/>
                      </Sticky>
                    </GridColumn>


                    <GridColumn width={15}>
                      <Visibility context={contextRef} >
                        {children}
                      </Visibility>
                    </GridColumn>
                    </>
                    ) : ( 
                    <>
                      <Grid.Column floated="left" width={1} />
                      <Grid.Column width={15}>{children}</Grid.Column>
                    </>)}

                  </Grid>
                </Ref>
              </Media>

              <Media between={['mobile', 'tablet']}> {/*tablet value849 not included */}
                <Ref  innerRef={contextRef}>
                  <Grid>
                    {!messagesRoute ? (<> 
                      <GridColumn floated="left" width={2}>
                      <Sticky context={contextRef} >
                        <SideMenu user={user} pc={false}/>
                      </Sticky>
                    </GridColumn>


                    <GridColumn width={14}>
                      <Visibility context={contextRef} >
                        {children}
                      </Visibility>
                    </GridColumn>
                    </>
                    ) : ( 
                    <>
                      <Grid.Column floated="left" width={1} />
                      <Grid.Column width={15}>{children}</Grid.Column>
                    </>)}

                  </Grid>
                </Ref>
              </Media>

              <Media between={['zero', 'mobile']}>
                <MobileHeader user={user} />
                <Grid>
                  <Grid.Column>{children}</Grid.Column>
                </Grid>
              </Media>

            </div>
          </MediaContextProvider>
        </>
      ) : (
        <>        {/* user - false -> not registered -> if on /login page -> children is of login page || if on /signup page -> children is of signup page . BCZ by what page layout is being called is stored in component. So compnt is called as ana ctive page.*/}
          <Navbar />
          <Container style={{ paddingTop: "1rem" }} text>
            {children}
          </Container>
        </>
      )}
    </>
  );
}

export default Layout;

import React, { Children, Component, createRef } from "react";
import HeadTags from "./HeadTags";
import Navbar from "./Navbar";
import { Container, Visibility, Grid, Sticky, Ref, Divider, Segment, GridColumn } from "semantic-ui-react";
import nProgress from "nprogress";
//always remember, deafault packages names start with lower case --> not next/Router. its next/router
import Router from "next/router" 
import SideMenu from "./SideMenu";
import Search from "./Search";

//destruture prop as an object
function Layout({children, user}) {     //layouts children is component -- cmpnt is an active page

  //console.log({children})
  const contextRef = createRef()

  Router.onRouteChangeStart =()=> nProgress.start()     //on routechange start, start animating the progress bar
  Router.onRouteChangeComplete =  ()=> nProgress.done()     //on routechange end, complete animating the progress bar
  Router.OnRouteChangeError = ()=>nProgress.done()      //if there is any error on changing the route

  return (
    <>  
      <HeadTags />
      {user ? (
        <>
          <div style={{marginLeft:"1rem", marginRight:"1rem"}}>
            <Ref  innerRef={contextRef}>
              <Grid>
                <GridColumn floated="left" width={2}>
                  <Sticky context={contextRef} >
                    <SideMenu user={user} />
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

              </Grid>
            </Ref>
          </div>
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

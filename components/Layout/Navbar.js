import React from "react";
import {Menu, Container, Icon} from "semantic-ui-react";
import {useRouter} from "next/router"
//always remember, deafault packages names start with lower case --> not next/Link. its next/link
import Link from "next/link"    //anchor tags(defines a hyperlink) for next.js framework

function Navbar() {

  //initialize our useRouter Hook
  const router = useRouter()
  //console.log(router);

  function isActive(route){
    //router above has pathname property.
    //when we are on the signup page, the pathname will be inside string "/signup" or "/login" 
    return (router.pathname === route)
  }


  return( 
    <Menu fluid borderless>
      <Container text>

        <Link href="/login"> 
          <Menu.Item header active={isActive("/login")}>
            <Icon size="large" name="sign in" />
            Login
          </Menu.Item>
        </Link>


        <Link href="/signup"> 
          <Menu.Item header active={isActive("/signup")}>
            <Icon size="large" name="signup" />
            Signup
          </Menu.Item>
        </Link>

      </Container>
    </Menu>
  );
}

export default Navbar;

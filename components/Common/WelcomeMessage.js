import {Icon, Message, Divider} from "semantic-ui-react"
import {useRouter} from "next/router"
import Link from "next/link"

export const HeaderMessage=()=>{
    const router = useRouter()
    //a boolean variable to check the current Route 
    const signupRoute = router.pathname ==="/signup";

    return(
        <Message attached color="teal"
        header={signupRoute ? "Get Started" : "Welcome Back"}
        icon={signupRoute ? "settings" : "privacy"} 
        content={signupRoute ? "Create New Account" : "Login with Email and Password"}
        />
    );
};

export const FooterMessage=()=>{
    const router = useRouter()
    //a boolean variable to check the current Route 
    const signupRoute = router.pathname ==="/signup" ;

    return(
        <>
            {signupRoute ? (
            <>
                <Message attached="bottom" warning>
                    <Icon name="help circle" />
                    Existing User ?{" "}
                    <Link href="/login">Login Here</Link> Instead
                </Message>
                <Divider hidden/>
                
            </>
          ) : (
             <>
                <Message attached="bottom" info>
                    <Icon name="lock" />
                    <Link href="/reset">Forgot password?</Link>
                </Message>
                

                <Message attached="bottom" warning >
                    <Icon name="help circle" />
                    New User ?{" "}
                    <Link href="/signup">Signup Here </Link> Instead
                </Message>
             </>
             )}
        </>
    );
};


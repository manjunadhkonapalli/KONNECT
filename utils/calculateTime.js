import moment from "moment"     //'m' --> for simple moment package  -- a JS date library for parsing, validating, manipulating and validating the dates
import Moment from "react-moment"   //'M' --> for react moment pakcage -- React component for the moment date library




const calculatedTime = createdAt=>{

    const today = moment(Date.now())
    const postDate = moment(createdAt)

    // console.log(Date.now());
    // console.log(today);
    // console.log(postDate);

    const diffInHours = today.diff(postDate, "hours")

    if(diffInHours < 24){
        return (
        <>
            Today <Moment format="hh:mm A">{createdAt}</Moment>
        </>
        );
    }
    else if(diffInHours > 24 && diffInHours < 36){
        return (
        <>
            Yesterday <Moment format="hh:mm A">{createdAt}</Moment>
        </>)
    }
    else if(diffInHours > 36){
        return <Moment format="DD/MM/YYYY hh:mm A">{createdAt}</Moment>
    }


}

export default calculatedTime;
// import moment from "moment"     //'m' --> for simple moment package  -- a JS date library for parsing, validating, manipulating and validating the dates
// import Moment from "react-moment"   //'M' --> for react moment pakcage -- React component for the moment date library

// const calculateTime = createdAt=>{

//     const today = moment(Date.now())
//     const postDate = moment(createdAt)

//     const diffInHours = today.diff(postDate, "hours")

//     if(diffInHours < 24){
//         return (
//         <>
//             Today <Moment format="hh:mm A">{createdAt}</Moment>
//         </>
//         );
//     }
//     else if(diffInHours > 24 && diffInHours < 36){
//         return (
//         <>
//             Yesterday <Moment format="hh:mm A">{createdAt}</Moment>
//         </>)
//     }
//     else if(diffInHours > 36){
//         return <Moment format="DD/MM/YYYY hh:mm A">{createdAt}</Moment>
//     }


// }

// export default calculateTime;



// momentjs has been deprecated. It was replaced with dayjs in final project.


import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const calculateTime = createdAt => {
  const date1 = dayjs();
  const date2 = dayjs(createdAt);
  const diffInDays = date1.diff(date2, "day");

  if (diffInDays > 6) {
    return date2.format("DD/MM/YYYY");
  } else {
    return date1.to(date2);
    //return date1.format("hh:mm DD/MM/YYYY")
  }
};

export default calculateTime;
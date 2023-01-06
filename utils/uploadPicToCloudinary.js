import axios from "axios";  //It is a client based HTTP library that lets developers make requests to either their own or third-party server to fetch data

//Media - the state that we created on signup page
async function uploadPic(media){
    try{
        
        //form is to packup the data and send all at once as post request
        const form = new FormData();     //construct a new form data - this is a constructor
        
        //after this, append properties to these form variable
        form.append('file', media);      //media is state -> actual file
        form.append('upload_preset', "social_media");    //preset name in cloudinary
        
        //also works even if ("cloud", "manjunadh")
        form.append("cloud_name", "manjunadh");  //cloud name in cloudinary -> bcz in Base api link, only cloud name differs

        //Now make post request with the axios 
        const res = await axios.post(process.env.CLOUDINARY_URL, form);    //inside the body, we`re going to send the form which we created 

        console.log(process.env.CLOUDINARY_URL)
        console.log(res.data.url)
        
        //here we will return url of the image - resides in res.data.url
        return res.data.url;

    }catch(error){
        return ;
    }

}

export default uploadPic
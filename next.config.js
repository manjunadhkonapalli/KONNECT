//next.config.js is a great way to have all env variables in your front end - 
//all we need to do is, export an object with env property

//--Commmon Js module
module.exports = {
  env: {
    CLOUDINARY_URL: "https://api.cloudinary.com/v1_1/manjunadh/image/upload"
  }
};

// //---ES6 module
// export const obj  = {
//   env: {
//           CLOUDINARY_URL: "https://api.cloudinary.com/v1_1/manjunadh/image/upload"
//        }
// };



//Diff btwn  next.config.js & config.env
//next.config.js is env file for frontend, those are not accessible on the backend.
//config.env is for backend, those variables won't be available on frontend.
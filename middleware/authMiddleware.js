//this is going to be middleware for our protected routes on the backend
//So wherever we have to protect the API routes, we  will use this auth middleware

const jwt = require("jsonwebtoken")

module.exports = (req, res, next)=>{
    try {
        
        if(!req.headers.authorization){
            return  res.status(401).send("Unauthorized");
        }

        //revise token generation in signup page fo reference
        const {userId} = jwt.verify(req.headers.authorization, process.env.jwtSecret)
        req.userId = userId     //basically adding the property on req obj
        next();

    } catch (error) {
        console.log(error);
        return  res.status(401).send("Unauthorized");
    }
}
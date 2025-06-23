const jwt = require("jsonwebtoken");
const JWT_SECRET="UWatchFree";


const fetchuser=(req, res, next)=>{
    const token= req.header("auth-token");
    if(!token){
        res.status(401).json({"error":"Please login with valid credentials"});
    }
    try{
        const data=jwt.verify(token, JWT_SECRET);
        req.user=data.user;
        next();
    }
    catch(error){
        res.status(401).json({"error":"Please login with valid credentials"});
    }
}

module.exports=fetchuser;

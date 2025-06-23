const express= require("express");
const router= express.Router();
const User= require("./Schema/user");
const jwt = require("jsonwebtoken");
const JWT_SECRET="UWatchFree";
const { body, validationResult } = require("express-validator");
const bcrypt=require("bcryptjs");

router.post("/register", [
    body("username", "Username is required").notEmpty(),
    body("email", "Email is required").isEmail(),
    body("password", "Password is required").notEmpty(),
    
], async (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const salt= await bcrypt.genSalt(10);
      const hashPass=await bcrypt.hash(req.body.password, salt);
      await User.create({username: req.body.username, email: req.body.email, password: hashPass});
  
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.post("/login", [
    body("email", "Email is required").isEmail(),
    body("password", "Password is required").notEmpty(),
  ], async (req, res) =>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({errors: errors.array()});
    }
    try{
      const user=await User.findOne({email: req.body.email});
      if(!user){
        return res.status(401).json({error: "Invalid credentials"});
      }
      const passwordMatch=await bcrypt.compare(req.body.password, user.password);
      if(!passwordMatch){
        return res.status(401).json({error: "Invalid credentials"});
      }
      const data={
        user:{
          id: user._id
        }
      };
      const token=jwt.sign(data, JWT_SECRET);
      res.status(200).json({token});
    }
    catch(error){
      console.error(error);
      res.status(500).json({error: "Internal Server error"});
  }});

  router.get("/", async(req, res)=>{
    try{
      const users=await User.find();
      res.status(200).json(users);
    }
    catch(error){
      console.error(error);
      res.status(500).json({error: "Internal Server error"});
    }
  })



  module.exports=router;
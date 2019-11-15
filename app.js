//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const enc = require("mongoose-encryption");
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true,useUnifiedTopology:true});

const userSchema = new mongoose.Schema ({
    email:String,
    password:String
});



userSchema.plugin(enc,{secret:process.env.SECRET,encryptedFields:["password"]});

const User = new mongoose.model("User",userSchema);


app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});


// app.get("/secrets",function(req,res){
//     res.render("secrets");
// });

app.get("/submit",function(req,res){
    res.render("submit");
});


app.post("/register",function(req,res){
    const newUser = new User({
        email:req.body.username,
        password:req.body.password
    });
    newUser.save(function(err){
        if (err) res.send(err);
        else res.render("secrets");
    });
});


app.post("/login",function(req,res){
const username=req.body.username;
const password=req.body.password;
User.findOne({email:username},function(err,foundUser){
    if(err) res.send(err);
    else{
        if(foundUser){
            if(foundUser.password === password) res.render("secrets");
            else res.send("Email and password do not match !");
        }
        else res.send("User not found");
    }
});
});


app.listen(3000,function(){
    console.log("Server running on port 3000");
});
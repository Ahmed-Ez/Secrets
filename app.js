//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const _ = require("lodash");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  }));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGO_URL,{useNewUrlParser:true,useUnifiedTopology:true});
mongoose.set("useCreateIndex",true);

const userSchema = new mongoose.Schema ({
    username:String,
    password:String,
    secrets:[]
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User",userSchema);

passport.use(User.createStrategy());
 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});


app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        User.findById(req.user.id,function(err,foundUser){
            if(err) console.log(err);
            else{
                if(foundUser) res.render("secrets",{secrets:foundUser.secrets,user:foundUser.username});
                else console.log("user not found");
            }
        });
    }
    else{
        res.redirect("/login");
    }
});

// app.get("/:user",function(req,res){
//     res.render("submit",{user:req.params.user});
// });

app.get("/submit/:user",function(req,res){
    res.render("submit",{user:req.params.user});
});

app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
});


// app.post("/submit",function(req,res){
//     console.log("lmao");
// });

app.post("/submit",function(req,res){
    User.updateOne({username:req.body.userName},{$push:{secrets:req.body.secret}},function(err){
        if(err) console.log(err);
    });
    res.render("submitted");
});

app.post("/register",function(req,res){
User.register({username:req.body.username},req.body.password,function(err,user){
    if(err){
        console.log(err);
        res.redirect("/register");
    }
    else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }
});
   
});


app.post("/login",function(req,res){
const newUser = User({
    username:req.body.username,
    password:req.body.password
});




req.login(newUser,function(err){
    if(err){
        console.log(err);
        res.redirect("/login");
    }
    else{
        passport.authenticate("local")(req,res,function(){
            res.redirect("/secrets");
        });
    }
});

});




app.listen(process.env.PORT || 3000, function() {
    console.log("Server started on port 3000");
  });
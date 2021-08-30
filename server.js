const express=require("express");
const PORT=3000;
const app=express();
const cookieParser=require("cookie-parser");
const session=require("express-session");

//database
const User=require("./Model/User");

//set templating Engine
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(session({
    key:"user_id",
    secret:"MySecret",
    resave:false,
    saveUninitialized:false,
    cookie:{
        expire:600000,
    }
}))

//Authentication function

var sessionChecker=(req,res,next)=>{
    if(req.session.user && req.cookies.user_id){
        res.redirect("/dashboard")
    }else{
        next()
    }
}

//Navigation
app.get("/",(req,res)=>{
    res.render("home");
});



app.route("/signin").get(sessionChecker,(req,res)=>{
    res.render("signin");
})
.post(async(req,res)=>{
    var username=req.body.username, password= req.body.password;

    try{
        var user=await User.findOne({username:username}).exec();
        if(!user){
            res.redirect("/signin");
        }
        user.comparePassword(password,(err,match)=>{
            if(!match){
                res.redirect("/signin")
            }
        })
        req.session.user=user;
        res.redirect("/dashboard")
    }catch(error){
        console.log(error);
    }
});

app.route("/signup").get(sessionChecker,(req,res)=>{
    res.render("signup");
})
.post((req,res)=>{
    var user=new User({
        username:req.body.username,
        email:req.body.email,
        password:req.body.password
    })
    user.save((err,doc)=>{
        if(err){
            res.redirect("/signup")
        }
        else{
            req.session.user=doc
            res.redirect("/dashboard")
        }
    })
})

app.get("/dashboard",(req,res)=>{
    if(req.session.user && req.cookies.user_id){
        res.render("dashboard",{Username:req.session.user.username});
    }
    else{
        res.redirect("/signin");
    }
})

app.get("/logout",(req,res)=>{
    if(req.session.user && req.cookies.user_id){
        res.clearCookie("user_id");
        res.redirect("/");
    }
    else{
        res.redirect("/signin");
    }
})
app.use(function(req,res,next){
    res.status(404).send("Sorry can't found the resourcesyou want!");
})

app.listen(PORT,()=>{
    console.log(`Server is listening on port ${PORT}`);
})
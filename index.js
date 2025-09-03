import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv";
import GoogleStrategy from "passport-google-oauth2";
import flash from "connect-flash";
import ImageKit from "imagekit";
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });





const app = express();
const port = 3000;

app.use(express.static("public"));

env.config();
const saltRounds = 10;

var imagekit = new ImageKit({
    publicKey : process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey : process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint : process.env.IMAGEKIT_URL_END_POINT,
});



const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
}
);
db.connect();

app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true, cookie: { maxAge: 24 * 60 * 60 * 1000 } }));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));



var newdata = [];

app.use(flash());



// app.get("/",(req,res)=>{

//   res.render("index.ejs",[blogCategories,blog_data]);

// });
async function fetch_blog_data(){
  var blog_data = await db.query("SELECT * FROM posts ORDER BY id ASC ");
  return blog_data.rows;
}

async function fetch_comments_data(){
  var comments_data = await db.query("SELECT * FROM comments ORDER BY id ASC ");
  return comments_data.rows;
}

var blog_data=await fetch_blog_data();
var comments_data=await fetch_comments_data();



app.get("/", async (req, res) => {
  if (req.isAuthenticated()) {
    res.render("index.ejs",{blog_data:blog_data});
  } else {
    res.redirect("/login");
  }
});
app.get("/search", async (req, res) => {
  if (req.isAuthenticated()) {
    var category=req.query.type;
    var new_blog_data=blog_data.filter((blog)=>blog.category.toLowerCase()===category.toLowerCase());
    if(new_blog_data.length>0){
      res.render("index.ejs",{blog_data:new_blog_data});
    }else{
      res.render("index.ejs",{blog_data:blog_data,err:"!!Blog Category Not Found"});
    }
  } else {
    res.redirect("/login");
  }
});



app.get("/admin",(req,res)=>{
  if (req.isAuthenticated()) {
    
    res.render('admin.ejs', { activeTab: 'dashboard' });
  } else {
    res.redirect("/login");
  }

});
app.get("/admin/create",(req,res)=>{
  if (req.isAuthenticated()) {
    
    res.render('admin.ejs', { activeTab: 'create' });
  } else {
    res.redirect("/login");
  }


});

app.get("/login", (req, res) => {
  res.render("login.ejs",{ message: req.flash("error") });
}); 


app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"],
}));

app.get("/auth/google/heisenBlog",passport.authenticate("google",{
  successRedirect:"/",
  failureRedirect:"/login",
}));

app.get("/register", (req, res) => {
  res.render("register.ejs", { message: req.flash("error") });
});

app.get("/post/:postId",(req,res)=>{
  if (req.isAuthenticated()) {
    var postid=req.params.postId;

  var post=blog_data.filter((post)=>post.id===postid);
  // var title=post[0].title;
  // var description=post[0].description;
  // console.log(comments_data);
  var comments=comments_data.filter((comment)=>(comment.blog_id===postid ));
  
  
  res.render('post.ejs',{postId:postid,post:post[0],comments:comments});
  } else {
    res.redirect("/login");
  }
}


);
app.post("/post/:postId/comment",async (req,res)=>{
  if (req.isAuthenticated()) {
    var postid=req.params.postId;
    console.log(req.body);


    var result =await db.query("INSERT INTO comments(blog_id,name,content,createdat) VALUES($1,$2,$3,NOW()) RETURNING *",[postid,req.body.name,req.body.comment]);
    comments_data.push(result.rows);
    
    res.redirect(`/post/${postid}`);
  

  
  } else {
    res.redirect("/login");
  }

  
})
app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      req.flash("error", "User already exists. Please log in.");
      return res.redirect("/register");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          req.flash("error", "Error hashing password.");
          return res.redirect("/register");
        } else {
          const result = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hash]
          );
          const user = result.rows[0];
          req.login(user, (err) => {
            if (err) {
              req.flash("error", "Registration succeeded but login failed.");
              return res.redirect("/register");
            }
            res.redirect("/");
          });
        }
      });
    }
  } catch (err) {
    req.flash("error", "Server error during registration.");
    res.redirect("/register");
  }
});
app.post("/login",passport.authenticate("local",{
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true,
  
}));
app.post("/add", (req, res) => {
  const newpost = {
    title: req.body.title,
    content: req.body.content
  }
  newdata.push(newpost);
  data.push(newpost);
  res.redirect("/");

});


passport.use("local", new Strategy(async function verify(username, password, cb) {
  try {
      const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
        username,
      ]);
      if (result.rows.length > 0) {
        // console.log("User found:", result.rows[0]);
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            //Error with password check
            console.error("Error comparing passwords:", err);
            return cb("Server error");
          } else {
            if (valid) {
              //Passed password check
              return cb(null, user);
            } else {
              //Did not pass password check
              return cb(null,false, { message: "Incorrect username or password." });
            }
          }
        });
      } else {

        return cb(null, false, { message: "user not found try registering first" });
      }
    } catch (err) {
      cb("Server error: " );
      console.log(err);
    }

}));
passport.use("google", new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/heisenBlog",
}, async (accessToken, refreshToken, profile, cb) => {
  // console.log(profile);
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [profile.email]);
    if (result.rows.length === 0) {
      const newUser = await db.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *", [profile.email, "google"]);
      return cb(null, newUser.rows[0]);
    }
    else {
      const user = result.rows[0];
      return cb(null, user);
    }
  } catch (err) {
    return cb(err);
  }
}));
passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

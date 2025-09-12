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
import fs from 'fs';
import { error } from "console";
import { GoogleGenAI } from "@google/genai";

const upload = multer({ dest: 'uploads/' });




env.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));


const saltRounds = 10;

var imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_END_POINT,
});



const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
db.connect();

app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true, cookie: { maxAge: 24 * 60 * 60 * 1000 } }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));



var newdata = [];

app.use(flash());

app.use(express.json());

// app.get("/",(req,res)=>{

//   res.render("index.ejs",[blogCategories,blog_data]);

// });
async function fetch_blog_data() {
  var blog_data = await db.query("SELECT * FROM posts ORDER BY id ASC ");
  return blog_data.rows;
}

async function fetch_comments_data() {
  var comments_data = await db.query("SELECT * FROM comments ORDER BY id ASC ");
  return comments_data.rows;
}

var blog_data = await fetch_blog_data();
var comments_data = await fetch_comments_data();
var user_blogs = [];
var comments = [];




app.get("/", async (req, res) => {
  if (req.isAuthenticated()) {
    res.render("index.ejs", { blog_data: blog_data });
  } else {
    res.redirect("/login");
  }
});
app.get("/search", async (req, res) => {
  if (req.isAuthenticated()) {
    var category = req.query.type;
    var new_blog_data = blog_data.filter((blog) => blog.category.toLowerCase() === category.toLowerCase());
    if (new_blog_data.length > 0) {
      res.render("index.ejs", { blog_data: new_blog_data });
    } else {
      res.render("index.ejs", { blog_data: blog_data, err: "!!Blog Category Not Found" });
    }
  } else {
    res.redirect("/login");
  }
});



app.get("/admin", (req, res) => {
  if (req.isAuthenticated()) {
    let user_id = req.user.id;

    user_blogs = blog_data.filter((blog) => blog.user_id == user_id);
    comments = comments_data.filter((comment) => comment.blog_id in user_blogs);


    res.render('admin.ejs', { activeTab: 'dashboard', user_blogs: user_blogs, comments: comments,messages: { success: req.flash("success"), error: req.flash("error") }});
  } else {

    res.redirect("/login");
  }

});
app.get("/admin/create", (req, res) => {
  if (req.isAuthenticated()) {

    res.render('admin.ejs', { activeTab: 'create', messages: { success: req.flash("success"), error: req.flash("error") } });
  } else {
    res.redirect("/login");
  }


});
app.get("/admin/:blog_id/delete",async(req,res)=>{
  const blog_id=req.params.blog_id;
   if (req.isAuthenticated()) {
    try {
          
          blog_data.splice(blog_data.findIndex((blog)=>blog.id==blog_id),1);
          user_blogs.splice(user_blogs.findIndex((blog)=>blog.id==blog_id),1);
          const resul = await db.query(`DELETE FROM posts WHERE id=${blog_id}`);
          console.log(resul);
          req.flash("success", "Blog deleted successfully!");
          res.redirect('/admin');

        } catch (err) {
          req.flash("error", "Blog not deleted server error!");
          res.redirect('/admin');

        }


    
  } else {
    res.redirect("/login");
  }

})
app.get("/login", (req, res) => {
  res.render("login.ejs", { message: req.flash("error") });
});


app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"],
}));

app.get("/auth/google/heisenBlog", passport.authenticate("google", {
  successRedirect: "/",
  failureRedirect: "/login",
}));

app.get("/register", (req, res) => {
  res.render("register.ejs", { message: req.flash("error") });
});

app.get("/post/:postId", (req, res) => {
  if (req.isAuthenticated()) {
    var postid = req.params.postId;
    console.log(postid);

    var post = blog_data.filter((blog) => blog.id == postid);
    // var title=post[0].title;
    // var description=post[0].description;
    // console.log(comments_data);
    var comments = comments_data.filter((comment) => (comment.blog_id == postid));



    res.render('post.ejs', { postId: postid, post: post[0], comments: comments });
  } else {
    res.redirect("/login");
  }
}


);
app.post("/post/:postId/comment", async (req, res) => {
  if (req.isAuthenticated()) {
    var postid = req.params.postId;
    


    var result = await db.query("INSERT INTO comments(blog_id,name,content,createdat) VALUES($1,$2,$3,NOW()) RETURNING *", [postid, req.body.name, req.body.comment]);
    comments_data.push(result.rows);

    res.redirect(`/post/${postid}`);



  } else {
    res.redirect("/login");
  }


});

// generate with AI route

app.post('/api/generate', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { topic } = req.body;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${topic} generate a blog content for this topic (as if this might have been written by some of the breaking-bad characters with those iconic dialoges in between) in html with out the boilerplate, only the html tags like h1,lists,h2 etc and not also in the section/article tag`,
    });
    let generatedText = response?.text;

    if (!generatedText && response?.candidates?.length > 0) {
      generatedText = response.candidates[0]?.content?.parts[0]?.text;
    }
    if (!generatedText) generatedText = "<p>No content generated.</p>";
    // console.log(generatedText);
    res.json({ generatedText });
  } catch (err) {
    res.status(500).json({ error: 'AI generation failed.' });
  }
});
app.post("/admin/create", upload.single('image'), async (req, res) => {
  if (req.isAuthenticated()) {
    const imagefile = req.file;
    const fileBuffer = fs.readFileSync(imagefile.path);

    imagekit.upload({
      file: fileBuffer,
      fileName: imagefile.originalname,
      folder: "/blogs"
    }, async (error, result) => {
      if (error) {
        req.flash("error", "Blog not uploaded error!");
        res.redirect('/admin/create');

      } else {
        const optimizedurl = imagekit.url({
          path: result.filePath,
          transformation: [
            { quality: 'auto' },
            { format: 'webp' },
            { width: '1000' }
          ]
        });
        const blog = req.body;
        try {
          const resul = await db.query(`INSERT INTO posts values($1,$2,$3,$4,NOW(),${req.user.id},$5 ) RETURNING *`, [blog.title, blog.description, blog.category, optimizedurl, blog.name]);
          blog_data.push(resul.rows[0]);
          req.flash("success", "Blog uploaded successfully!");
          res.redirect('/admin/create');

        } catch (err) {
          req.flash("error", "Blog not uploaded server error!");
          res.redirect('/admin/create');

        }
      }
    });
  } else {
    res.redirect("/login");
  }









});

app.put("/admin/edit/:blogId", upload.single('image'), async (req, res) => {
  const blog_id = req.params.blogId;
  const { title, name, category, description } = req.body;

  try {
    const result = await db.query(`
      UPDATE posts SET 
        title = $1,
        name = $2,
        category = $3,
        description = $4,
        createdat = NOW()
      WHERE id = $5
      RETURNING *
    `, [title, name, category, description, blog_id]);

    res.status(200).json({ success: "Blog updated successfully!", updatedBlog: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while updating blog" });
  }
});



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
app.post("/login", passport.authenticate("local", {
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
            return cb(null, false, { message: "Incorrect username or password." });
          }
        }
      });
    } else {

      return cb(null, false, { message: "user not found try registering first" });
    }
  } catch (err) {
    cb("Server error: ");
    console.log(err);
  }

}));
passport.use("google", new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://heisenblog.onrender.com/auth/google/heisenBlog",
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

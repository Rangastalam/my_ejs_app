import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv";
import GoogleStrategy from "passport-google-oauth2";

const app = express();
const port = 3000;

app.use(express.static("public"));

env.config();
const saltRounds = 10;


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


const data = [
  {
    title: "Season-1",
    content: "This is a sample post content."
  },

];
var newdata = [];




app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("index.ejs", { newposts: data });
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
}); 

app.get("/compose", (req, res) => {
  res.render("compose.ejs");
});
app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"],
}));

app.get("/auth/google/heisenBlog",passport.authenticate("google",{
  successRedirect:"/",
  failureRedirect:"/login",
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
app.get("/posts/:postName", (req, res) => {
  const requestedTitle = req.params.postName;
  data.forEach((post) => {
    if (post.title === requestedTitle) {
      res.render("post.ejs", { postTitle: post.title, postContent: post.content });
    }
  });
});


passport.use("local", new Strategy(async function verify(username, password, cb) {


}));
passport.use("google", new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/heisenBlog",
}, async (accessToken, refreshToken, profile, cb) => {
  console.log(profile);
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [profile.email]);
    if (result.rows.length === 0) {
      const newUser = await db.query("INSERT INTO users (email, password) VALUES ($1, $2)", [profile.email, "google"]);
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

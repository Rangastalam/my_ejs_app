import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

const data=[
  {
    title: "Season-1",
    content: "This is a sample post content."
  },
  {
    title: "Season-2",
    content: "This is a sample post content."
  },
  {
    title: "Season-3",
    content: "This is a sample post content."
  },
  {
    title: "Season-4",
    content: "This is a sample post content."
  },
  {
    title: "Season-5",
    content: "This is a sample post content."
  },
];
var newdata=[];
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/",(req,res)=>{
  res.render("index.ejs",{newposts: newdata});
  
});

app.get("/compose",(req,res)=>{
  res.render("compose.ejs");
});

app.post("/add",(req,res)=>{
  const newpost={
    title:req.body.title,
    content:req.body.content
  }
  newdata.push(newpost);
  data.push(newpost);
  res.redirect("/");

});
app.get("/posts/:postName",(req,res)=>{
  const requestedTitle = req.params.postName;
  data.forEach((post) => {
    if (post.title === requestedTitle) {
      res.render("post.ejs", { postTitle: post.title, postContent: post.content });
    }
  });
});



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

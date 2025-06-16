import express from "express";


const app = express();
const port = 3000;

app.use(express.static("public"));

app.get("/",(req,res)=>{
  res.render("index.ejs");
});

app.get("/compose",(req,res)=>{
  res.render("compose.ejs");
});

app.get("")
// app.get("/contact", (req, res) => {
//   res.render("contact.ejs");
// });



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

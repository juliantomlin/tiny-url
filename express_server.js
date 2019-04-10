const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs')

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new.ejs")
})


app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars)
})


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get(`/u/:shortURL`, (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL])
})

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL]
  console.log(urlDatabase)
  res.redirect(/urls/)
})

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL
  res.redirect(`/urls/${req.params.shortURL}`)
})

app.post("/urls", (req, res) => {
  random = generateRandomString()
  urlDatabase[random] = req.body.longURL
  console.log(urlDatabase);
  res.redirect(`/urls/${random}`);
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

function generateRandomString () {
  while (true){
    let r = Math.random().toString(36).substring(7);
    if (r.length === 6) {
      return r
    }
  }
}

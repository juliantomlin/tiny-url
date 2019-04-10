const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set('view engine', 'ejs')

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, login: req.cookies.username };
  res.render("urls_index", templateVars);
  console.log(req.cookies.username)
});

app.get("/urls/new", (req, res) => {
  let templateVars = { login: req.cookies.username}
  res.render("urls_new.ejs", templateVars)
})


app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], login: req.cookies.username};
  res.render("urls_show", templateVars)
})

app.get(`/u/:shortURL`, (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL])
})

app.post('/', (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect('/urls/')
})

app.post('/logout', (req, res) => {
  res.cookie('username', '')
  res.redirect('/urls/')
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

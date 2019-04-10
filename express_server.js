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

const users = {
    default: {
    id: "",
    email: "",
    password: ""
  },
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  if (req.cookies.user_id){
    templateVars.login = users[req.cookies.user_id].email
  }
  else {
    templateVars.login = ''
  }
  console.log(templateVars)
  res.render("urls_index", templateVars);
  console.log(req.cookies.username)
});

app.get("/urls/new", (req, res) => {
  let templateVars = {}
  if (req.cookies.user_id){
    templateVars.login = users[req.cookies.user_id].email
  }
  else {
    templateVars.login = ''
  }
  res.render("urls_new", templateVars)
})

app.get("/register/", (req, res) => {
  let templateVars = {}
  if (req.cookies.user_id){
    templateVars.login = users[req.cookies.user_id].email
  }
  else {
    templateVars.login = ''
  }
  res.render("register", templateVars)
})


app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  if (req.cookies.user_id){
    templateVars.login = users[req.cookies.user_id].email
  }
  else {
    templateVars.login = ''
  }
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

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password){
    res.sendStatus(400)
  }
  else{
    for (user in users){
      if (users[user].email === req.body.email) {
        res.sendStatus(400)
      }
    }
    let random = generateRandomString()
    let userInfo = {id: random, email:req.body.email, password: req.body.password}
    res.cookie('user_id', random)
    users[random] = userInfo
    console.log(users)
    res.redirect(/urls/)
  }
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
  let random = generateRandomString()
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

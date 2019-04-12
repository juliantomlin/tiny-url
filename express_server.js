const express = require("express")
const app = express()
const PORT = 8080
const bodyParser = require("body-parser")
const bcrypt = require('bcrypt')
const cookieSession = require('cookie-session')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
}))
app.set('view engine', 'ejs')

const getUserUrls = function (userLoggedIn, database) {
  let list = {}
  for (url in database) {
    if (database[url].userID === userLoggedIn) {
      list[url] = database[url].longURL
    }
  }
  return list
}

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID"}
}

const users = {
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
  if (users[req.session.user_id]){
    res.redirect('/urls/')
  }
  else {
    res.redirect('/login/')
  }
})

app.get("/urls", (req, res) => {
  let templateVars = {}
  if (users[req.session.user_id]) {
    templateVars.urls = getUserUrls(req.session.user_id, urlDatabase)
    templateVars.login = users[req.session.user_id].email
  }
  else {
    templateVars.login = ''
    templateVars.urls = ''
  }
  res.render("urls_index", templateVars)
})

app.get("/urls/new", (req, res) => {
  if (users[req.session.user_id]) {
    let templateVars = {}
    if (req.session.user_id) {
      templateVars.login = users[req.session.user_id].email
    }
    else {
      templateVars.login = ''
    }
    res.render("urls_new", templateVars)
  }
  else{
    res.redirect('/login/')
  }
})

app.get("/login/", (req, res) => {
  let templateVars = {}
  if (users[req.session.user_id]) {
    res.redirect('/urls/')
  }
  else {
    templateVars.login = ''
    res.render("login", templateVars)
  }
})

app.get("/register/", (req, res) => {
  let templateVars = {}
  if (users[req.session.user_id]){
    res.redirect('/urls/')
  }
  else {
    templateVars.login = ''
    res.render("register", templateVars)
  }
})


app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, viewCount: urlDatabase[req.params.shortURL].viewCount}
    if (req.session.user_id) {
      templateVars.login = users[req.session.user_id].email
      if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
        templateVars.owner = 'yes'
      }
      else{
        templateVars.owner = 'no'
      }
    }
    else {
      templateVars.login = ''
      templateVars.owner = 'no'
    }
    res.render("urls_show", templateVars)
  }
  else {
    res.sendStatus(404)
  }
})

app.get(`/u/:shortURL`, (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL)
    urlDatabase[req.params.shortURL].viewCount += 1
  }
  else {
    res.sendStatus(404)
  }
})

app.get('/password_recovery', (req, res) => {
  res.send('Just make a new account then, LUL')
})

app.post('/', (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect('/urls/')
})

app.post('/logout', (req, res) => {
  req.session = null
  res.redirect('/urls/')
})

app.post('/login', (req, res) => {
if (!req.body.email || !req.body.password) {
    res.sendStatus(400)
  }
  else {
    for (user in users) {
      if (users[user].email === req.body.email) {
        if (bcrypt.compareSync(req.body.password, users[user].password)) {
          req.session.user_id = user
          res.redirect('/urls/')
        }
        else {
          res.send('Incorrect e-mail or password')
        }
      }
    }
    res.send('Non-existant Email')
  }
})

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.sendStatus(400)
  }
  else {
    for (user in users) {
      if (users[user].email === req.body.email) {
        res.sendStatus(400)
      }
    }
    let random = generateRandomString()
    let userInfo = {id: random, email:req.body.email, password: bcrypt.hashSync(req.body.password, 10)}
    req.session.user_id = random
    users[random] = userInfo
    res.redirect(/urls/)
  }
})

app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL]
    res.redirect(/urls/)
  }
  else {
    res.send('HEY! How did you do this!? Stop that!')
  }
})

app.post('/urls/:shortURL', (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL
    res.redirect(`/urls/${req.params.shortURL}`)
  }
  else {
    res.send('HEY! How did you do this!? Stop that!')
  }
})

app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    let random = generateRandomString()
    urlDatabase[random] = { longURL: req.body.longURL, userID: req.session.user_id }
    urlDatabase[random].viewCount = 0
    res.redirect(`/urls/${random}`)
  }
  else {
    res.send('HEY! How did you do this!? Stop that!')
  }
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})

function generateRandomString () {
  while (true) {
    let r = Math.random().toString(36).substring(7)
    if (r.length === 6) {
      return r
    }
  }
}

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const bcrypt = require('bcrypt')
const saltRounds = 10
const app = express()
const jwt = require('jsonwebtoken')
const PORT = process.env.PORT || 8080

app.use(cors())
app.use(bodyParser.json())
models = require('./models')

let userId = ''

function authenticate(req, res, next) {
  let headers = req.headers["authorization"]

  let token = headers.split(' ')[1]
  jwt.verify(token, 'twasbrillig', (err, decoded) => {
    if(decoded) {
      if(decoded.userId) {
        userId = decoded.userId
        console.log('decoded')
        next()
      } else {
        res.status(401).json({message: 'Invalid Token'})
      }
    } else {
      res.status(401).json({message: 'Invalid Token', err: err})
    }
  })
}

let hardCodeBooks = [
  {
    title: "Harry Potter",
    genre: "Fantasy",
    publisher: "Bloomsbury",
    year: "1997",
    imageURL: "https://vignette.wikia.nocookie.net/harrypotter/images/7/7b/Harry01english.jpg/revision/latest/scale-to-width-down/1000?cb=20150208225304"
  }
]

app.post('/api/books', authenticate, (req,res) => {
  let title = req.body.title
  let genre = req.body.genre
  let publisher = req.body.publisher
  let year = req.body.year
  let imageURL = req.body.imageURL

  let book = models.Book.build({
    title: title,
    genre: genre,
    publisher: publisher,
    year: year,
    imageURL: imageURL
  })
  book.save().then((savedBook) => {
    res.json({success: true, message: 'Book was added!'})
  })
})

app.post('/api/delete-book', authenticate, (req,res) => {
  let deleteID = req.body.deleteID
  models.Book.destroy({
    where: {
      id: deleteID
    }
  }).then((deletedBook)=> {
    console.log(`Book with id ${deletedBook} was deleted.`)
    res.json({success: true, message: 'Book was removed!'})
  })
})

app.get('/api/books', (req,res) => {
  models.Book.findAll().then((books) => {
    res.json(books)
  })
})

app.get('/api/update/book-id/:id', (req,res) => {
  let id = parseInt(req.params.id)
  models.Book.findByPk(id).then((book) => {
    res.json(book)
  })
})

app.post('/api/update/book-id/:id', authenticate, (req,res) => {
  let id = req.params.id
  let title = req.body.title
  let genre = req.body.genre
  let publisher = req.body.publisher
  let year = req.body.year
  let imageURL = req.body.imageURL
  models.Book.update({
    title: title,
    genre: genre,
    publisher: publisher,
    year: year,
    imageURL: imageURL
  }, {
    where: {
      id:id
    }
  }).then((bookID) => {
    console.log(`Book with id ${bookID} was updated.`)
    res.json({success: true, message: 'Book was updated!'})
  })
})

app.post('/login', (req,res) => {
  let userName = req.body.userName
  let pass = req.body.pass
  models.User.findAll({
    where: {
      userName: userName
    }
  }).then((user) => {
    if(user.length == 0){
      res.json({success:false, message: 'User does not exist.'})
    }
    else {
      bcrypt.compare(req.body.pass, user[0].pass, function(err, response) {
        if(response){
          jwt.sign({userId: user[0].id}, 'twasbrillig', function(error, token) {
            if(token) {
              res.json({success:true, message: 'User Logged In.', token: token, userId: user[0].id})
            } else {
              res.status(500).json({message: 'Unable to generate token', error: error})
            }
          })
        }
        else {
          res.json({sucess:false, message: 'Invalid Password.', err: err})
        }
      })
    }
  })
})

app.post('/register', (req,res) => {
  let userName = req.body.userName
  let email = req.body.email
  let pass = bcrypt.hashSync(req.body.pass, saltRounds)
  models.User.findAll({
    where: {
      userName: userName
    }
  }).then((userOld) => {
    if(userOld.length == 0){
      let user = models.User.build({
        userName: userName,
        pass: pass,
        email: email
      })
      user.save().then((savedUser) => {
        res.json({success: true, message: 'User was register!'})
      })
    } else {
      res.json({success:false, message: 'Username already exists.'})
    }
  })
})

app.get('/profile/user-id/:id', (req,res) => {
  let id = req.params.id
  models.User.findAll({
    where: {
      id: id
    }
  }).then(userData => {
    let user = {
      userName: userData[0].userName,
      email: userData[0].email
    }
    res.json(user)
  })
})

app.post('/profile/user-id/:id', authenticate, (req,res) => {
  let id = req.params.id
  let email = req.body.email
  models.User.update({
    email: email
  }, {
    where: {
      id:id
    }
  }).then(user => {
    res.json({success:true, message: `User email with id ${user} was updated.` })
  })
})

app.listen(PORT,function(){
  console.log("Books getting served..")
})

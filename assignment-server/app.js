const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 8080

app.use(cors())
app.use(bodyParser.json())
models = require('./models')

let hardCodeBooks = [
  {
    title: "Harry Potter",
    genre: "Fantasy",
    publisher: "Bloomsbury",
    year: "1997",
    imageURL: "https://vignette.wikia.nocookie.net/harrypotter/images/7/7b/Harry01english.jpg/revision/latest/scale-to-width-down/1000?cb=20150208225304"
  }
]

app.post('/api/books', (req,res) => {
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

app.post('/api/delete-book', (req,res) => {
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
    res.json(books)
  })
})

app.post('/api/update/book-id/:id', (req,res) => {
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
})

app.listen(PORT,function(){
  console.log("Books getting served..")
})

const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()

const Note = require('./models/note')

morgan.token('body', (req, response) => JSON.stringify(req.body))

const requestLogger = (req, res, next) => {
    console.log('Method: ', req.method)
    console.log('Path: ', req.path)
    console.log('Body: ', req.body)
    console.log('---')
    next()
}

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
  
    next(error)
  }

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'Unknown endpoint' })
}

app.use(cors())
app.use(express.json())
app.use(requestLogger)
app.use(express.static('dist'))

app.use(morgan(':method :url : status :res[content-length] - :response-time ms :body'))

app.get('/api/notes', (request, response) => {
    Note.find({}).then(notes => {
        response.json(notes)
    })
})

app.get('/api/notes/:id', (request, response, next) => {
    Note.findById(request.params.id)
        .then(note => {
            if(note) {
                response.json(note)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
    Note.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

 {/*
 const generateId = () => {
     const maxId = notes.length > 0
         ? Math.max(...notes.map(n => n.id))
         : 0
     return maxId + 1
 }
 */}

app.post('/api/notes', (request, response, next) => {

    const body = request.body

    const note = new Note({
        content: body.content,
        important: body.important || false,
    })

    note.save()
        .then(savedNote => {
            response.json(savedNote)
    })
        .catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
    const { content, important } = request.body

    Note.findByIdAndUpdate(
        request.params.id, 
        {content, important}, 
        { new: true, runValidators: true, context: 'query' }
    )
        .then(updatedNote => {
            response.json(updatedNote)
        })
        .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
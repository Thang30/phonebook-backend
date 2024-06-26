const express = require('express');
const morgan = require('morgan'); 
const cors = require('cors');
const mongoose = require('mongoose');
const Person = require('./models/person');

const app = express();
const PORT = process.env.PORT || 3001
app.use(express.static('dist'))

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.log('Error connecting to MongoDB:', error.message));

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

morgan.token('body', (req, res) => {
  if (req.method === 'POST' && req.body) {
    return JSON.stringify(req.body); 
  }
  return ' - ';
});

app.use(morgan(':method :url :status :response-time ms [:body]'));

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(persons => {
      res.json(persons);
    })
    .catch(error => next(error));
});

app.get('/info', (req, res, next) => {
  Person.countDocuments({})
    .then(count => {
      res.send(`<p>Phonebook has info for ${count} people</p><p>${new Date()}</p>`);
    })
    .catch(error => next(error));
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).send({ error: 'Person not found' });
      }
    })
    .catch(error => next(error));
});

app.post('/api/persons', (req, res, next) => {
  const { name, number } = req.body;

  if (!name || !number) {
    return res.status(400).json({ error: 'Missing name or number' });
  }

  const newPerson = new Person({ name, number });

  newPerson.save()
    .then(savedPerson => res.status(201).json(savedPerson))
    .catch(error => next(error));
});

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body;

  if (!name || !number) {
    return res.status(400).json({ error: 'Missing name or number' });
  }

  const updatedPerson = { name, number };

  Person.findByIdAndUpdate(req.params.id, updatedPerson, { 
    new: true, 
    runValidators: true, 
    context: 'query' 
  })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'Person not found' });
      }
    })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(result => {
      if (result) {
        res.status(204).end();
      } else {
        res.status(404).json({ error: 'Person not found' });
      }
    })
    .catch(error => next(error));
});

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(400).send({ error: 'Malformatted id' });
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const express = require('express');
const morgan = require('morgan'); 
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001

const phonebook = [
  { id: '1', name: 'Arto Hellas', number: '040-123456' },
  { id: '2', name: 'Ada Lovelace', number: '39-44-5323523' },
  { id: '3', name: 'Dan Abramov', number: '12-43-234345' },
  { id: '4', name: 'Mary Poppendieck', number: '39-23-6423122' },
];

app.use(cors({
  origin: 'http://localhost:5173' 
}));

app.use(express.json());

morgan.token('body', (req, res) => {
  if (req.method === 'POST' && req.body) {
    return JSON.stringify(req.body); 
  }
  return ' - ';
});

app.use(morgan(':method :url :status :response-time ms [:body]'));

app.get('/api/persons', (req, res) => {
  res.json(phonebook);
});

app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id;
  const person = phonebook.find((p) => p.id === id);

  if (person) {
    res.json(person);
  } else {
    res.status(404).send(`Person with id ${id} not found.`);
  }
});

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id;
  const personIndex = phonebook.findIndex((p) => p.id === id);

  if (personIndex !== -1) {
    phonebook.splice(personIndex, 1); 
    res.status(204).send(); 
  } else {
    res.status(404).send(`Person with id ${id} not found.`);
  }
});

app.post('/api/persons', (req, res) => {
  const newPerson = req.body; 

  if (!newPerson.name || !newPerson.number) {
    return res.status(400).json({ error: 'Missing name or number' }); 
  }

  if (phonebook.find((p) => p.name === newPerson.name)) {
    return res.status(409).json({ error: 'name must be unique' }); 
  }

  let uniqueId;
  do {
    uniqueId = Math.floor(Math.random() * 1000000000).toString();
  } while (phonebook.find((p) => p.id === uniqueId)); 

  phonebook.push({ id: uniqueId, ...newPerson });

  res.status(201).json({ ...newPerson, id: uniqueId }); 
});

// Route to update a phonebook entry (PUT)
app.put('/api/persons/:id', (req, res) => {
  const id = req.params.id;
  const updatedPerson = req.body;

  if (!updatedPerson.name || !updatedPerson.number) {
    return res.status(400).json({ error: 'Missing name or number' });
  }

  const personIndex = phonebook.findIndex((p) => p.id === id);

  if (personIndex !== -1) {
    phonebook[personIndex] = { id, ...updatedPerson };
    res.json(phonebook[personIndex]);
  } else {
    res.status(404).send(`Person with id ${id} not found.`);
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

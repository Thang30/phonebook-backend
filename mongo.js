const mongoose = require('mongoose');
require('dotenv').config();

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

// const url = `mongodb+srv://fullstack24:${password}@cluster0.w42b9vh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const url = process.env.MONGODB_URI;
console.log("The mongodb url is:", url);

mongoose.set('strictQuery', false)

mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

if (name && number) {
  const person = new Person({
    name: name,
    number: number,
  });

  person.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`);
    mongoose.connection.close();
  });
} else {
  Person.find({}).then(result => {
    console.log('phonebook:');
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  });
}

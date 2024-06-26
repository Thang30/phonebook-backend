const mongoose = require('mongoose');
require('dotenv').config();

const url = process.env.MONGODB_URI;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error.message);
  });

const phoneValidator = (number) => {
  if (number.length < 8) return false;

  const regex = /^\d{2,3}-\d+$/;
  return regex.test(number);
};

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [3, 'name `{VALUE}` is not of the correct format. Please add a better name'],
    required: [true, 'name `{VALUE}` is not of the correct format. Please add a better name']
  },
  number: {
    type: String,
    required: [true, 'phone number `{VALUE}` is not of the correct format. Please add a better phone number'],
    validate: {
      validator: phoneValidator,
      message: props => `phone number ${props.value} is not of the correct format. Please add a better phone number`
    }
  }
});

module.exports = mongoose.model('Person', personSchema);

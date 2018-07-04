const mongoose = require('mongoose');

// define a schema for the game model
// this and all other models inherit from mongoose.Schema

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: 'Please enter game title',
  },
  publisher: {
    type: String,
    required: 'Please enter publisher',
  },
  imageUrl: {
    type: String,
    required: 'Please enter URL of game cover image',
  },
  year: {
    type: Number,
  },
});

// before it is saved, it will run this function
gameSchema.pre('save', function (next) {
  // ! must use 'function' above so 'this' refers to correct object
  // get year from last 4 characters of imageUrl
  this.year = this.imageUrl.substr(-4);
  next();
});

gameSchema.methods.lastUrl = function () {
  const indexOfSlash = this.imageUrl.lastIndexOf('/');
  return this.imageUrl.substring(indexOfSlash + 1);
};

module.exports = mongoose.model('Game', gameSchema);

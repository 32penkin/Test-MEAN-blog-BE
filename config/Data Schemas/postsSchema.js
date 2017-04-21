const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  name: {type: String},
  content: {type: String},
  date: {type: String},
  author: {type: String}
});

module.exports = postSchema;
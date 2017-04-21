const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
  content: {type: String},
  date: {type: String},
  post_id: {type: String},
  author: {type: String}
});
module.exports = commentSchema;
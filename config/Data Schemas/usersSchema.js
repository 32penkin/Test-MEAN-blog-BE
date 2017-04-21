const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {type: String},
  password: {type: String},
  email: {type: String},
  firstname: {type: String},
  lastname: {type: String}
});

module.exports = userSchema;
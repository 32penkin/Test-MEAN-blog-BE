const express = require('express');
const app = express();
const mongojs = require('mongojs');
const dbPosts = mongojs('bloglist', ['bloglist']);
const dbComments = mongojs('commentlist', ['commentlist']);
const bodypParser = require('body-parser');


// app.use(express.static(__dirname + '/dist'));
app.use(bodypParser.json());

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'accept, content-type, x-parse-application-id, x-parse-rest-api-key, x-parse-session-token');
  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
});

app.get('/bloglist', function (req, res) {
  dbPosts.bloglist.find(function (err, docs) {
    res.json(docs);
  });
});

app.post('/bloglist', function (req, res) {
  dbPosts.bloglist.insert(req.body, function (err, docs) {
    res.json(docs);
  });
});

app.get('/bloglist/:id', function (req, res) {
  let id = req.params.id;
  dbPosts.bloglist.findOne({_id: mongojs.ObjectId(id)}, function (err, docs) {
    res.json(docs);
  });
});

app.get('/commentlist', function (req, res) {
  dbComments.commentlist.find(function (err, docs) {
    res.json(docs);
  });
});

app.get('/commentlist/:post_id', function (req, res) {
  let post_id = req.params.post_id;
  dbComments.commentlist.find({post_id: post_id}, function (err, docs) {
    res.json(docs);
  });
});

app.post('/commentlist', function (req, res) {
  dbComments.commentlist.insert(req.body, function (err, docs) {
    res.json(docs);
  });
});


const server = app.listen(3000, function () {
  console.log('Server running at http://localhost:' + server.address().port);
});
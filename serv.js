const express = require('express');
const mongojs = require('mongojs');
const bodypParser = require('body-parser');

let connectionString = 'mongodb://bloglist:bloglist@ds111549.mlab.com:11549/bloglist';
//let connectionString = 'mongodb://localhost:27017/bloglist';
const app = express();
const db = mongojs(connectionString, ['bloglist', 'commentlist']);
const postsCollection = db.collection('bloglist');
const commentCollection = db.collection('commentlist');

app.use(bodypParser.json());

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'accept, content-type, x-parse-application-id, x-parse-rest-api-key, x-parse-session-token');
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
});

app.get('/bloglist', function (req, res) {
  postsCollection.find(function (err, docs) {
    res.json(docs);
  });
});

app.post('/bloglist', function (req, res) {
  postsCollection.insert(req.body, function (err, docs) {
    res.json(docs);
  });
});

app.get('/bloglist/:id', function (req, res) {
  let id = req.params.id;
  postsCollection.findOne({_id: mongojs.ObjectId(id)}, function (err, docs) {
    res.json(docs);
  });
});

app.get('/commentlist', function (req, res) {
  commentCollection.find(function (err, docs) {
    res.json(docs);
  });
});

app.get('/commentlist/:post_id', function (req, res) {
  let post_id = req.params.post_id;
  commentCollection.find({post_id: post_id}, function (err, docs) {
    res.json(docs);
  });
});

app.post('/commentlist', function (req, res) {
  commentCollection.insert(req.body, function (err, docs) {
    res.json(docs);
  });
});


const server = app.listen(3000, function () {
  console.log('Server running at http://localhost:' + server.address().port);
});

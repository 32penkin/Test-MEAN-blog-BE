const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const jwtdecode = require('jwt-decode');
const config = require('./config/appconfig');
const passport = require('./config/passportconfig');
const postSchema = require('./config/Data Schemas/postsSchema');
const commentSchema = require('./config/Data Schemas/commentsSchema');
const userSchema = require('./config/Data Schemas/usersSchema');

const db = mongoose.createConnection(config.connectionString);
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function callback() {
  console.log("Connected!")
});

let postsCollection = db.model('postlist', postSchema);
let commentsCollection = db.model('commentlist', commentSchema);
let userCollection = db.model('userlist', userSchema);


const app = express();
app.set('port', (process.env.PORT || 3000));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'accept, content-type, x-parse-application-id, ' +
    'x-parse-rest-api-key, x-parse-session-token, Authorization');
  if ('OPTIONS' == req.method) { res.sendStatus(200) }
  else { next() }
});

app.get('/bloglist', function (req, res) {
  postsCollection.find(function (err, docs) {
    res.json(docs);
  });
});

app.post('/bloglist', function (req, res) {
  postsCollection.create(req.body, function (err, docs) {
    res.json(docs);
  });
});

app.get('/bloglist/:id', function (req, res) {
  let id = req.params.id;
  postsCollection.findById(id)
    .then(
      function (post) {
        res.json(post);
      },
      function (err) {
        res.sendStatus(400);
      }
    );
});

app.get('/commentlist', function (req, res) {
  commentsCollection.find(function (err, docs) {
    res.json(docs);
  });
});

app.get('/commentlist/:post_id', function (req, res) {
  let post_id = req.params.post_id;
  commentsCollection.find({post_id: post_id}, function (err, docs) {
    res.json(docs);
  });
});

app.post('/commentlist', function (req, res) {
  commentsCollection.create(req.body, function (err, docs) {
    res.json(docs);
  });
});

app.post('/userlist', function (req, res) {
  userCollection.findOne({
    username: req.body.username
  }, function (err, user) {
    if (err) throw err;
    if (!user) {
      res.send({success: false, message: 'Authentication failed. User not found.'});
    } else {
      if (req.body.password == user.password) {
        let token = jwt.sign(user, config.secretString);
        res.json({success: true, token: token});
      }
      else {
        res.send({success: false, message: 'Authentication failed. Passwords did not match.'});
      }
    }
  });
});


app.get('/profile', function (req, res) {
  let a = req.headers.authorization;
  let currentUserDecodedEmail = jwtdecode(a)._doc.email;
  userCollection.findOne({email: currentUserDecodedEmail}, function (err, user) {
    res.json(user);
  });
});

app.post('/register', function (req, res) {
  userCollection.findOne({username: req.body.username}, function (err, user) {
    if (user) {
      res.json(null);
      return;
    }
    else {
      let newUser = new userCollection(req.body);
      newUser.save(function (err, user) {
        req.login(user, function (err) {
          if (err) {
            return next(err);
          }
          res.json(user);
        });
      });
    }
  });
});

app.post('/logout', function (req, res) {
  res.send(200);
});

app.listen(app.get('port'), function () {
  console.log('App is running on port', app.get('port'));
});
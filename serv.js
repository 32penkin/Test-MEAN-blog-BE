const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const cookieParser = require('cookie-parser');
const session = require('express-session');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(function (username, password, done) {
  userCollection.findOne({username: username, password: password}, function (err, user) {
    if(user){
      return done(null, user);
    }
    return done(null, false, {message: 'Unable to login'});
  });
}));
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});

let connectionString = 'mongodb://bloglist:bloglist@ds111549.mlab.com:11549/bloglist';
//let connectionString = 'mongodb://localhost:27017/bloglist';
const app = express();

const db = mongoose.createConnection(connectionString);
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function callback () {
  console.log("Connected!")
});

const postSchema = new mongoose.Schema( {
  name: { type: String },
  content: { type: String },
  date: { type: String },
  author: { type: String }
} );

const commentSchema = new mongoose.Schema( {
  content: { type: String },
  date: { type: String },
  post_id: {type: String},
  author: { type: String }
} );

const userSchema = new mongoose.Schema( {
  username: {type: String},
  password: {type: String},
  email: {type: String},
  firstname: {type: String},
  lastname: {type: String}
} );

let postsCollection = db.model('postlist', postSchema);
let commentsCollection = db.model('commentlist', commentSchema);
let userCollection = db.model('userlist', userSchema);


app.set('port', (process.env.PORT || 3000));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'this is the secret' }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'accept, content-type, x-parse-application-id, x-parse-rest-api-key, x-parse-session-token');
  if ('OPTIONS' == req.method) {
    res.sendStatus(200);
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

app.post('/userlist', passport.authenticate('local'), function (req, res) {
  res.json(req.user);
});

app.post('/register', function (req, res) {
  userCollection.findOne({username: req.body.username}, function (err, user) {
    if(user){
      res.json(null);
      return;
    }
    else {
      let newUser = new userCollection(req.body);
      newUser.save(function (err, user) {
        req.login(user, function (err) {
          if(err) { return next(err); }
          res.json(user);
        });
      });
    }
  });
});


app.post('/logout', function(req, res) {
  req.session.destroy();
  res.send(200);
});

// const server = app.listen(3000, function () {
//   console.log('Server running at http://localhost:' + server.address().port);
// });

app.listen(app.get('port'), function() {
  console.log('App is running on port', app.get('port'));
});
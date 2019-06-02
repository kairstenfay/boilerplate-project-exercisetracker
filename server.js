const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const findOrCreateUser = require('./models.js').findOrCreateUser;
const addExercise = require('./models.js').addExercise;
const findUserById = require('./models.js').findUserById;

const app = express()
const t = 10000;

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/exercise/new-user", function(req, res, next) {
  const username = req.body.username;

  findOrCreateUser(username, function(err, doc) {
    clearTimeout(t);
    if(err) { return (next(err)); }
    res.json(doc);
  });
});

app.post("/api/exercise/add", function(req, res, next) {
  let data = undefined;

  try {
    data = validateInput(req.body);
  } catch (e) {
    res.json(e.toString());
  }

  findUserById(data.userId, function(err, doc) {
    if (err) { return (next(err)); }
    if (!doc) {
      res.send("unknown user id");
    } else {
      addExercise(data, function(err, doc) {
        if (err) { return (next(err)); }
        res.json(doc);
      });
    }
  })
});

const validateInput = function(input) {
  let parsed = {};
  parsed.description = input.description.toString(); // what could go wrong

  try {
    parsed.userId = mongoose.Types.ObjectId(input.userId);
  } catch (e) { throw Error("invalid userId"); }

  try {
    parsed.duration = Number(input.duration);
    if (!parsed.duration || parsed.duration < 0) {
      throw Error;
    }
  } catch (e) { throw Error("invalid duration"); }

  try {
    parsed.date = new Date(input.date);
  } catch (e) { throw Error("invalid date"); }

  return parsed;
}

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

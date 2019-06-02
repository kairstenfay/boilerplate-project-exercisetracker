const mongoose = require('mongoose')
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
        .catch(function(reason) {console.log(reason)});

/* Schemas and models */
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {type: String, unique: true, required: true},
});

const exerciseSchema = new Schema({
    userId: {type: String, required: true},
    description: {type: String, required: true},
    duration: {type: Number, required: true},
    date: Date
});

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

const addExercise = function(data, done) {
    const document = new Exercise(data);

    document.save(function (err, exercise) {
        if (err) return console.error(err);
        console.log(`Exercise ${document.description} saved to collection.`);
        done(null, exercise);
    });
}

const findUserById = function(userId, done) {
    User.findById(userId, function(err, doc) {
        if (err) { return console.error(err); }
        done(null, doc);
    });
};

const findOrCreateUser = function(username, done) {
    User.findOne({ username: username}, function(err, doc) {
        if (err) { return console.error(err); }
        if (doc) {
            done(null, doc);
        } else {
            createUser(username, function(err, doc) {
                if (err) { return console.error(err); }
                done(null, doc);
            });
        }
    });
};

const createUser = function(username, done) {
    const document = new User({ username: username });

    document.save(function (err, user) {
        if (err) return console.error(err);
        console.log(document.username + " saved to user collection.");
        done(null, user);
    });
};

exports.findOrCreateUser = findOrCreateUser;
exports.addExercise = addExercise;
exports.findUserById = findUserById;

const mongoose = require('mongoose')
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
        .catch(function(reason) {console.log(reason)});

/* Schemas and models */
const Schema = mongoose.Schema;

const userSchema = new Schema({
    _id: Schema.Types.ObjectId,
    username: {type: String, unique: true, required: true},
});

const exerciseSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    description: {type: String, required: true},
    duration: {type: Number, required: true, min: [0, 'Too short duration']},
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

// 5cf335196d348addad2e6310
const findExercisesByUser = function(query, limit, done) {

    findUserById(query.userId, function(err, doc) {  // todo? needs separate function?
        if (err) { return console.error(err); }
        if (!doc) {
            done(null, "Unknown userId");
        }
        Exercise.find(query, function(err, doc) {
            if (err) { return console.error(err); }
            done(null, doc);
        })
        .limit(limit).populate('userId');
    });
};

const findUserById = function(userId, done) {
    User.findById(userId, function(err, doc) {
        if (err) { return console.error(err); }
        done(null, doc);
    });
};

const findAllUsers = function(done) {
    User.find(function(err, docs) {
        if (err) { return console.error(err); }
        done(null, docs);
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
exports.findExercisesByUser = findExercisesByUser;
exports.findUserById = findUserById;
exports.findAllUsers = findAllUsers;

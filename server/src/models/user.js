var mongoose = require('mongoose');
const bcrypt = require('bcrypt');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    unique: 1,
    trim: true,
    sparse: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  date_joined: {
    type: Date,
    default: Date.now,
  },
  task: {
    treebank: String,
    workingTreebanks: [String],
    finishedTreebanks: [String],
    currentTask: String,
    finishedTasks: [String],
  },
  role: {
    type: String,
    enum: ['admin', 'adjudicator', 'annotator', 'experimenter'],
    required: true,
  },
  subjects: [
    {
      id: mongoose.ObjectId,
      username: String,
      role: {
        type: String,
        enum: ['adjudicator', 'annotator'],
      },
      _id: false,
    },
  ],
  experiments: [mongoose.ObjectId], // For experimenter
  experimenter: mongoose.ObjectId, // For subjects
  experimentsAssigned: [mongoose.ObjectId], // For subjects
});

// Hashing the password
let SALT = 10;
UserSchema.pre('save', function (next) {
  var user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(SALT, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

// compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  let match = await bcrypt.compare(candidatePassword, this.password);
  return match;
};

const User = mongoose.model('User', UserSchema);

module.exports = { User };

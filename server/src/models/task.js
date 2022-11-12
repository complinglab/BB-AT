var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TaskSchema = new Schema({
  treebank: String,
  subjects: [{
    subjectId: String,
    completed: Boolean,
    sentIndex: Number,
    username: String,
    data: [{
      wordRTs: [Number],
      wordTags: [String],
      sentId: String,
      sentRT: Number,
      _id: false,
    }],
    normalizedData: Schema.Types.Mixed,
    _id: false,
  }],
  adjudicators: [{
    subjectId: String,
    username: String,
    completed: Boolean,
    sentIndex: Number,
    data: [{
      wordTags: [String],
      sentId: String,
      _id: false,
    }],
    _id: false,
  }],
  sents: [{
    file: String,
    sentId: String,
    text: String,
    flag: Number,
    words: [String]
  }],
  experiment: mongoose.ObjectId
});

const Task = mongoose.model('Task', TaskSchema);

module.exports = { Task }
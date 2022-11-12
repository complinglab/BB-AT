var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ExperimentSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  experimenter: {
    type: mongoose.ObjectId,
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
  tags: [
    {
      tag: String,
      description: String,
      enabled: Boolean,
      _id: false,
    },
  ],
  parameters: {
    numShared: Number,
    numSharedAdju: Number,
    scaling: String,
    highlightType: {
      type: String,
      enum: ['discrete', 'continuous'],
    },
    highlightBoundaries: [Number],
    highlights: [String],
    matchMismatch: {
      type: Boolean,
      default: true,
    },
    annConfidence: {
      type: Boolean,
      default: false,
    },
    sentenceDiff: {
      type: Boolean,
      default: false,
    },
  },
});

const Experiment = mongoose.model('Experiment', ExperimentSchema);

module.exports = { Experiment };

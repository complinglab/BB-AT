const { Task } = require('../models/task');
const { User } = require('./../models/user');
const { Experiment } = require('./../models/experiment');

const getExptList = async (experimenter) => {
  let expts = await Experiment.find({ experimenter }).select('_id title');
  console.log(expts);
  return expts;
};

const createUser = async (
  username,
  password,
  experimenter,
  role,
  experiment
) => {
  // Save new user to db
  const newUser = await new User({
    password,
    username,
    experimenter,
    role,
    experiments: [experiment],
    task: {
      workingTreebanks: [],
      finishedTreebanks: [],
      finishedTasks: [],
    },
  }).save();

  // Add new user to relevant experimenter
  let expter = await User.findById(experimenter);
  expter.subjects.push({
    id: newUser._id,
    username,
    role,
  });
  await expter.save();

  // Add new user to relevant experiment
  let expt = await Experiment.findById(experiment);

  expt.subjects.push({
    id: newUser._id,
    username,
    role,
  });
  await expt.save();

  if (!newUser) {
    console.log('user creation failed');
  } else {
    return newUser;
  }
};

const deleteUser = async (userId, experimenter, experiment, role) => {
  // delete user document
  await User.findByIdAndDelete(userId);

  // Remove user from experimenter's subjects field
  await User.findByIdAndUpdate(experimenter, {
    $pull: { subjects: { id: userId } },
  });

  // Remove user from experiment's subjects/adjudicators field
  await Experiment.findByIdAndUpdate(experiment, {
    $pull: { subjects: { id: userId } },
  });
  // subjects: { $elemMatch: {subjectId: userId} }

  if (role === 'annotator') {
    await Task.updateMany({}, { $pull: { subjects: { subjectId: userId } } });
  } else if (role === 'adjudicator') {
    await Task.updateMany(
      {},
      { $pull: { adjudicators: { subjectId: userId } } }
    );
  }

  return;
};

const getExpt = async (id) => {
  let expt = await Experiment.findOne({ experimenter: id });
  return expt;
};

const getData = async (id) => {
  let tasks = await Task.find({ experiment: id });
  let users = await User.find({
    experiments: id,
    // role: "annotator"
  });
  return { tasks, users };
};

const updateTags = async (tags, id) => {
  let expt = await Experiment.findByIdAndUpdate(id, { tags });
  return;
};

const updateParas = async (parameters, id) => {
  let expt = await Experiment.findByIdAndUpdate(id, { parameters });
  return;
};

module.exports = {
  createUser,
  deleteUser,
  getExpt,
  getData,
  getExptList,
  updateTags,
  updateParas,
};

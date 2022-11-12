const { Task } = require('../models/task');
const { User } = require('../models/user');
const { Experiment } = require('../models/experiment');

// @desc return {<treebank>: <availability>}. Available if tasks allotment space available and user hasn't finished the treebank

exports.treebankGet = async (subject, experimentId, role) => {
  console.log(subject, experimentId, role);
  let experiment = await Experiment.findById(experimentId, {}, { lean: true });
  let tasks = await Task.find({ experiment: experimentId });

  let user = await User.findOne({ _id: subject });

  let { numShared, numSharedAdju } = experiment.parameters;
  let tbMap = {};

  if (role === 'annotator') {
    // Map number of tasks available to treebanks
    tasks.forEach((task) => {
      let treebank = task.treebank;
      let totalSubs = task.subjects.length || 0;
      if (!tbMap[treebank]) tbMap[treebank] = { count: 0 };
      if (totalSubs < numShared) tbMap[treebank]['count'] += 1;
    });

    // Map True if user has finished treebank before.
    for (const tb in tbMap) {
      if (tbMap.hasOwnProperty(tb)) {
        if (user.task.finishedTreebanks.includes(tb)) {
          tbMap[tb]['finished'] = true;
        } else tbMap[tb]['finished'] = false;
      }
    }

    return tbMap;
  } else if (role === 'adjudicator') {
    tasks.forEach((task) => {
      let treebank = task.treebank;
      // Check number of adjudicators on each task doesn't exceed prescribed limit
      // Check number of tasks available in each treebank that are annotated maximally
      let totalAdju = task.adjudicators.length || 0;
      let count = 0;
      task.subjects.forEach((sub) => {
        if (sub.completed) count += 1;
      });
      if (!tbMap[treebank]) tbMap[treebank] = { count: 0 };
      if (count === numShared && totalAdju < numSharedAdju)
        tbMap[treebank]['count'] += 1;
    });

    // Map True if user has adjudicated treebank before.
    for (const tb in tbMap) {
      if (tbMap.hasOwnProperty(tb)) {
        if (user.task.finishedTreebanks.includes(tb)) {
          tbMap[tb]['finished'] = true;
        } else tbMap[tb]['finished'] = false;
      }
    }
    console.log(tbMap);
    return tbMap;
  }
};

exports.treebankSet = async (user, treebank) => {
  updatedUser = await User.findOneAndUpdate(
    { _id: user },
    { 'task.treebank': treebank }
  );

  if (!updatedUser) throw new Error('User not found for updating document');
  else {
    return;
  }
};

// When user is done with annotating the full treebank, move treebank to finished treebanks array
exports.treebankReset = async (user, status) => {
  let userDoc = await User.findOne({ _id: user });
  let treebank = userDoc.task.treebank;

  if (treebank) {
    if (status === 'finished') {
      updatedUser = await User.findOneAndUpdate(
        { _id: user },
        {
          'task.treebank': null,
          $push: { 'task.finishedTreebanks': treebank },
        }
      );
    } else if (status === 'working') {
      updatedUser = await User.findOneAndUpdate(
        { _id: user },
        {
          'task.treebank': null,
          $push: { 'task.workingTreebanks': treebank },
        }
      );
    }
  }

  if (!updatedUser) throw new Error('User not found for updating document');
  else {
    console.log(`Pushed ${treebank} to ${status} for ${userDoc.email}`);
    return;
  }
};

// Check if user has selected a treebank already and is in the middle of it
exports.treebankCheck = async (subject) => {
  const user = await User.findOne({ _id: subject });
  if (user.task.treebank) {
    return true;
  } else {
    return false;
  }
};

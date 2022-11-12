const { Task } = require('../models/task');
const { User } = require('../models/user');
const { SigninAuthError, NoTaskError } = require('../helpers/errors');
// const {
//   globalDeviationScaling,
//   globalMinMaxScaling,
//   tagMinMaxScaling
// } = require('../helpers/RTscaling');
const { Experiment } = require('../models/experiment');

// Tasks with subject's preference that have not reached max users allotment nor has been alloted to the subject before
const tasksAvailable = async (subject, treebank, parameters, role, exptId) => {
  let { numShared, numSharedAdju } = parameters;

  if (role === 'annotator') {
    let tasks = await Task.find({
      $and: [
        { treebank: treebank },
        { [`subjects.${numShared - 1}`]: { $exists: false } },
        { 'subjects.subjectId': { $ne: subject } },
        { experiment: exptId },
      ],
    });
    return tasks.length;
  } else if (role === 'adjudicator') {
    tasks = await Task.find({
      $and: [
        { treebank: treebank },
        { [`adjudicators.${numSharedAdju - 1}`]: { $exists: false } },
        { 'adjudicators.subjectId': { $ne: subject } },
        { experiment: exptId },
      ],
    });

    // Find tasks which is maximally annotated
    let countTask = 0;
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      let count = 0;
      task.subjects.forEach((sub) => {
        if (sub.completed === true) count += 1;
      });
      if (count === numShared) {
        countTask += 1;
      }
    }
    return countTask;
  }
};

const taskAllot = async (subject, parameters, exptId, role) => {
  let userDoc = await User.findOne({ _id: subject });
  console.log('Start task allocation for: ', userDoc.username);

  let { treebank } = userDoc.task;
  let { numShared, numSharedAdju } = parameters;

  let subDoc = {
    subjectId: subject,
    completed: false,
    sentIndex: 0,
    data: [],
  };
  let allotedTask;
  let tasks;
  if (role === 'annotator') {
    allotedTask = await Task.findOneAndUpdate(
      {
        $and: [
          { treebank: treebank },
          { [`subjects.${numShared - 1}`]: { $exists: false } },
          { 'subjects.subjectId': { $ne: subject } },
          { experiment: exptId },
        ],
      },
      { $push: { subjects: subDoc } },
      { new: true }
    ).exec();
  } else if (role === 'adjudicator') {
    // Find all relevant tasks
    tasks = await Task.find({
      $and: [
        { treebank: treebank },
        { [`adjudicators.${numSharedAdju - 1}`]: { $exists: false } },
        { 'adjudicators.subjectId': { $ne: subject } },
        { experiment: exptId },
      ],
    });

    // Pick task which is maximally annotated
    let validTask;
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      console.log(task._id);
      let count = 0;
      task.subjects.forEach((sub) => {
        if (sub.completed === true) count += 1;
      });
      if (count === numShared) {
        validTask = task;
        break;
      }
    }

    if (validTask) {
      allotedTask = await Task.findByIdAndUpdate(
        validTask._id,
        { $push: { adjudicators: subDoc } },
        { new: true }
      );

      console.log('alloted', allotedTask);
    } else {
      throw new NoTaskError('No tasks available', 404);
    }
  }

  if (!allotedTask) {
    throw new NoTaskError('No tasks available', 404);
  } else {
    console.log('Allocated task: ', allotedTask._id);

    let userDoc = await User.updateOne(
      { _id: subject },
      { 'task.currentTask': allotedTask.id }
    );

    return allotedTask;
  }
};

const taskFetch = async (subject, experimentId, role) => {
  let user = await User.findOne({ _id: subject });
  let experiment = await Experiment.findById(experimentId, {}, { lean: true });

  console.log(
    'taskFetch for',
    user.username,
    'for experiment',
    experiment.title
  );

  let { treebank } = user.task;
  let { parameters } = experiment;

  let taskCount = user.task.finishedTasks.length || 0;

  if (user) {
    if (user.task.currentTask) {
      let taskDoc = await Task.findOne({ _id: user.task.currentTask });
      let freeTasks = await tasksAvailable(
        subject,
        treebank,
        parameters,
        role,
        experimentId
      );

      return {
        taskDoc,
        taskCount,
        freeTasks,
        scaling: parameters.scaling,
        highlightType: parameters.highlightType,
        highlightBoundaries: parameters.highlightBoundaries,
        highlights: parameters.highlights,
      };
    } else {
      let taskDoc = await taskAllot(subject, parameters, experiment._id, role);
      let freeTasks = await tasksAvailable(
        subject,
        treebank,
        parameters,
        role,
        experimentId
      );
      return {
        taskDoc,
        taskCount,
        freeTasks,
        scaling: parameters.scaling,
        highlightType: parameters.highlightType,
        highlightBoundaries: parameters.highlightBoundaries,
        highlights: parameters.highlights,
      };
    }
  } else {
    throw new SigninAuthError('User not found', 404);
  }
};

const tagsGet = async (exptId) => {
  let expt = await Experiment.findById(exptId, {}, { lean: true });
  return expt.tags;
};

// @desc Saves annoted sentence data. If task is completed
// Append to finished tasks and treebanks key
const save = async (subject, payload) => {
  let user = await User.findById(subject);

  let data = {
    subjectId: subject,
    username: user.username,
    completed: payload.completed,
    sentIndex: payload.sentIndex,
    data: payload.subjectData.data,
  };

  if (user.role === 'adjudicator') {
    await Task.updateOne(
      {
        _id: payload.taskId,
        adjudicators: { $elemMatch: { subjectId: subject } },
      },
      {
        $set: { 'adjudicators.$': data },
      }
    );

    if (payload.completed) {
      await User.findOneAndUpdate(
        { _id: subject },
        {
          'task.currentTask': null,
          $push: { 'task.finishedTasks': payload.taskId },
        }
      );
    }
  }

  if (user.role === 'annotator') {
    await Task.updateOne(
      {
        _id: payload.taskId,
        subjects: { $elemMatch: { subjectId: subject } },
      },
      {
        $set: { 'subjects.$': data },
      }
    );

    if (payload.completed) {
      await User.findOneAndUpdate(
        { _id: subject },
        {
          'task.currentTask': null,
          $push: { 'task.finishedTasks': payload.taskId },
        }
      );
      // let normalizedData = {
      //   deviationMinMax: globalDeviationScaling(payload.subjectData.data),
      //   minMax: globalMinMaxScaling(payload.subjectData.data),
      //   tagMinMax: tagMinMaxScaling(payload.subjectData.data)
      // }

      // await Task.updateOne(
      //   {
      //     "_id": payload.taskId,
      //     subjects: { $elemMatch: {subjectId: subject} }
      //   },
      //   {
      //     $set: { "subjects.$.normalizedData": normalizedData }
      //   })
    }
  }
  return;
};

const getLabelAmbiguity = async (annotators) => {
  const labelAmbiguity = {};
  for (const annotator of annotators) {
    const user = await User.findOne(
      { username: annotator },
      {},
      { lean: true }
    );
    labelAmbiguity[annotator] = user['labelAmbiguity'];
  }
  return labelAmbiguity;
};

module.exports = {
  taskAllot,
  taskFetch,
  save,
  tagsGet,
  getLabelAmbiguity,
};

const express = require('express');
const { Experiment } = require('../models/experiment');
const { getExpt } = require('../services/expt');
const {
  taskFetch,
  tagsGet,
  save,
  getLabelAmbiguity,
} = require('../services/task');

const router = express.Router();
const csv = require('csv-parser');
const fs = require('fs');
const { result } = require('lodash');

router.get('/task', async (req, res) => {
  let { id, role } = req.user;
  // console.log('user: ', req.user);
  let subject = id;
  let exptId = req.user.experiments[0];
  let taskDetails = await taskFetch(id, exptId, role);

  if (!taskDetails) {
    console.log('no task details found!');
    return;
  }

  // console.log('task details: ', taskDetails);
  let {
    taskDoc,
    taskCount,
    freeTasks,
    scaling,
    highlightType,
    highlightBoundaries,
    highlights,
  } = taskDetails;

  // console.log(taskDoc);

  console.log('Final response taskid: ', taskDoc.id);
  let subjectData;
  let annotatorsData;
  if (role === 'annotator') {
    subjectData = taskDoc.subjects.filter((x) => x.subjectId === subject)[0];
  } else if (role === 'adjudicator') {
    subjectData = taskDoc.adjudicators.filter(
      (x) => x.subjectId === subject
    )[0];
    annotatorsData = taskDoc.subjects;
  }

  // console.log('object', highlightBoundaries, highlightType);
  let task = {
    // Task specific data
    taskId: taskDoc.id,
    treebank: taskDoc.treebank,
    sents: taskDoc.sents,
    taskCount,
    freeTasks,
    // Subject specific data
    sentIndex: subjectData.sentIndex,
    completed: subjectData.completed,
    subjectData,
    annotatorsData,
    // scaling parameter for adjudicators
    scaling,
    highlightType,
    highlightBoundaries,
    highlights,
  };
  if (subjectData.data[subjectData.sentIndex]) {
    task.annotated = subjectData.data[subjectData.sentIndex];
  }

  res.status(200).json(task);
});

router.get('/tags', async (req, res) => {
  let exptId = req.user.experiments[0];
  let tags = await tagsGet(exptId);
  res.status(200).json(tags);
});

router.post('/save', async (req, res) => {
  let payload = req.body;
  let { id, role } = req.user;

  await save(id, payload, role);
  res.status(200).send();
});

router.get('/labelambiguity', async (req, res) => {
  const { annotators } = req.query;
  const labelAmbiguity = await getLabelAmbiguity(annotators);

  res.status(200).json(labelAmbiguity);
});

router.get('/experiment', async (req, res) => {
  const { experiments } = req.user;

  const experiment = await Experiment.findById(experiments[0]);

  res.status(200).json(experiment);
});

router.get('/itemdifficulty', async (req, res) => {
  const results = [];

  fs.createReadStream('postprocessing/itemdifficulty.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      console.log('Parsed csv data', results.length);
      res.status(200).json({
        csvData: results,
      });
    });
});

module.exports = router;

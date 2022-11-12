var express = require('express');
const jwt = require('jsonwebtoken');

const { Task } = require('./../models/task');

const { signin } = require('../services/signin');
const { signup } = require('../services/signup');
const {
  treebankGet,
  treebankSet,
  treebankReset,
  treebankCheck,
} = require('../services/oldtreebank');
const { taskFetch, getTagSet } = require('../services/task');
const {
  dataFetch,
  updateParameter,
  updateTag,
} = require('../services/dashboard');
const { save } = require('../services/save');

const tokenSecret = process.env.JWT_SECRET;
var router = express.Router();

router.post('/user/signup', async (req, res) => {
  let { email, password, age } = req.body;
  newUser = await signup(email, password, age);
  res.status(200).json({ message: 'user created' });
});

router.post('/user/signin', async (req, res) => {
  let { email, password } = req.body;
  let { token, role } = await signin(email, password);
  res.status(200).json({ token, role });
});

// Check if treebank is already selected by user
router.get('/treebank/treebankcheck', isAuthenticated, async (req, res) => {
  let subject = req.user.sub;
  console.log('api check', subject);
  let treebankSelected = await treebankCheck(subject);
  res.status(200).json({ selected: treebankSelected });
});

// Fetch treebanks id
router.get('/treebank/treebanks', isAuthenticated, async (req, res) => {
  let { sub } = req.user;
  let tbMap = await treebankGet(sub);
  res.status(200).json(tbMap);
});

// Save selected treebank to user.task.treebank
router.post('/treebank/treebankset', isAuthenticated, async (req, res) => {
  let subject = req.user.sub;
  let treebank = req.body.treebank;
  let updatedTask = await treebankSet(subject, treebank);
  res.status(200).json({ response: `Saved treebank selection` });
});

// Reset treebank to offer new treebank
router.post('/treebank/treebankreset', isAuthenticated, async (req, res) => {
  let subject = req.user.sub;
  let { status } = req.body;
  let result = await treebankReset(subject, status);
  res.status(200).send();
});

// Fetch tagset
router.get('/tagset', isAuthenticated, async (req, res) => {
  let tagSet = await getTagSet();
  res.status(200).json(tagSet);
});

// Fetch task assigned to user
router.get('/task', isAuthenticated, async (req, res) => {
  let subject = req.user.sub;

  let taskDetails = await taskFetch(subject);
  let { taskDoc, taskCount, freeTasks } = taskDetails;

  console.log('Final response taskid: ', taskDoc.id);

  let subjectData = taskDoc.subjects.filter((x) => x.subjectId === subject)[0];
  let task = {
    // Task specific data
    taskId: taskDoc.id,
    treebank: taskDoc.treebank,
    sents: taskDoc.sents,
    taskCount,
    freeTasks,
    // Subject specific data
    sentIndex: subjectData.sentIndex,
    wordIndex: subjectData.wordIndex,
    completed: subjectData.completed,
  };
  if (subjectData.data[subjectData.sentIndex]) {
    task.annotated = subjectData.data[subjectData.sentIndex];
  }

  res.status(200).json(task);
});

// Save user annotated data
router.post('/save', isAuthenticated, async (req, res) => {
  let payload = req.body;
  let subject = req.user.sub;

  let result = await save(subject, payload);

  res.status(200).send();
});

router.get('/datafetch', isAdminAuth, async (req, res) => {
  let data = await dataFetch();
  res.status(200).json(data);
});

router.post('/update/parameter', isAdminAuth, async (req, res) => {
  let data = req.body;
  let result = await updateParameter(data);
  res.status(200).send();
});

router.post('/update/tags', isAdminAuth, async (req, res) => {
  let data = req.body;
  let result = await updateTag(data);
  res.status(200).send();
});

function isAuthenticated(req, res, next) {
  console.log('isAuthenticated middleware');
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    // Format of token \
    // Authorization: Bearer<access_token>
    const token = bearerHeader.split(' ')[1];
    // console.log(token)
    jwt.verify(token, tokenSecret, (err, user) => {
      if (err || user.role !== 'subject') {
        console.log(err);
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }
      req.user = user;
      next();
    });
  } else {
    res.status(403).send('Authorization unsuccesful');
  }
}

function isAdminAuth(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    // Format of token \
    // Authorization: Bearer<access_token>
    const token = bearerHeader.split(' ')[1];

    jwt.verify(token, tokenSecret, (err, user) => {
      if (err || user.role !== 'admin') {
        console.log(err);
        res.status(403).json({ message: 'Unauthorized' });
        return;
      } else req.user = user;
      next();
    });
  } else {
    res.status(403).json({ message: 'Unauthorized' });
  }
}

module.exports = router;

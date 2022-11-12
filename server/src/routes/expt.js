const express = require('express');

const {
  createUser,
  getExpt,
  getData,
  getExptList,
  deleteUser,
  updateTags,
  updateParas,
} = require('../services/expt');

const router = express.Router();

router.post('/createuser', async (req, res) => {
  let { username, password, role, experiment } = req.body;
  let newUser = await createUser(
    username,
    password,
    req.user.id,
    role,
    experiment
  );
  res.status(200).json({ user: newUser });
});

router.delete('/deleteuser', async (req, res) => {
  let { userId, experimentId, role } = req.body;
  let experimenter = req.user.id;
  await deleteUser(userId, experimenter, experimentId, role);
  res.status(200).json({ message: 'Subject delete' });
});

router.get('/experiment', async (req, res) => {
  let { id } = req.user;
  let experiment = await getExpt(id);
  res.status(200).json({ experiment });
});

router.get('/tasks', async (req, res) => {
  let { experimentId } = req.query;
  let response = await getData(experimentId);
  res.status(200).json(response);
});

router.get('/experimentlist', async (req, res) => {
  let { id } = req.user;
  let experimentList = await getExptList(id);
  res.status(200).json({ experimentList });
});

router.post('/updatetags', async (req, res) => {
  let { tags, id } = req.body;
  await updateTags(tags, id);
  res.status(200).send();
});

router.post('/updateparas', async (req, res) => {
  let { values, experimentId } = req.body;
  await updateParas(values, experimentId);
  res.status(200).send();
});

module.exports = router;

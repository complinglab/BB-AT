const express = require('express');
const {
  treebankGet,
  treebankSet,
  treebankReset,
  treebankCheck,
} = require('../services/treebank.js');

const router = express.Router();

router.get('/get', async (req, res) => {
  let { id, role } = req.user;
  let exptId = req.user.experiments[0];
  let tbMap = await treebankGet(id, exptId, role);
  res.status(200).json(tbMap);
});

router.post('/set', async (req, res) => {
  let { id } = req.user;
  let treebank = req.body.treebank;
  await treebankSet(id, treebank);
  res.status(200).json({ message: `Saved treebank selection` });
});

router.post('/reset', async (req, res) => {
  let { id } = req.user;
  let status = req.body.status;
  await treebankReset(id, status);
  res.status(200).json({ message: `Moved treebank to finished` });
});

router.get('/check', async (req, res) => {
  let { id } = req.user;
  let treebankSelected = await treebankCheck(id);
  res.status(200).json({ selected: treebankSelected });
});

module.exports = router;

const express = require('express');

const { signup, signin } = require('../services/exptAuth');

const router = express.Router();

router.post('/signup', async (req, res) => {
  let { username, email, password } = req.body;
  newUser = await signup(username, email, password);
  res.status(200).json({ message: 'user created' });
});

router.post('/signin', async (req, res) => {
  let { username, password } = req.body;
  let response = await signin(username, password);
  res.status(200).json(response);
});

module.exports = router;

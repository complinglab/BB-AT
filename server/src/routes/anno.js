const express = require('express');

const treebanks = require('./treebanks');
const tool = require('./tool');

const router = express.Router();
router.use('/treebanks', treebanks);
router.use('/tool', tool);

module.exports = router;

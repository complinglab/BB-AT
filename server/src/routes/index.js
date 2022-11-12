var express = require('express');
var router = express.Router();

const auth = require('./auth');
const expt = require('./expt');
const anno = require('./anno');

const exptAuthenticate = require('../middlewares/exptAuthenticate');
const annoAuthenticate = require('../middlewares/annoAuthenticate');

module.exports = (app) => {
  app.get('/', (req, res) => {
    res
      .status(200)
      .send({
        message:
          'Welcome to the AUTHENTICATION API. Register or Login to test Authentication.',
      });
  });

  app.use('/api/auth', auth);
  app.use('/api/expt', exptAuthenticate, expt);
  app.use('/api/anno', annoAuthenticate, anno);
};

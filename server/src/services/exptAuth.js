const jwt = require('jsonwebtoken');
const { SigninAuthError } = require('./../helpers/errors');
const { User } = require('./../models/user');
const { Experiment } = require('./../models/experiment');
const tokenSecret = process.env.JWT_SECRET;

const signup = async (username, email, password) => {
  const newUser = new User({
    email: email,
    password: password,
    username: username,
    role: 'experimenter',
  });

  const newExperiment = new Experiment({
    experimenter: newUser._id,
    title: 'Default',
    parameters: {
      numShared: 2,
      numSharedAdju: 1,
      scaling: 'model',
    },
  });

  newUser.experiments = [newExperiment._id];

  await newUser.save();
  await newExperiment.save();

  if (!newUser || !newExperiment) {
  } else {
    return newUser;
  }
};

const signin = async (username, password) => {
  let user = await User.findOne({ username: username });
  if (!user) {
    throw new SigninAuthError(`User not found`, 401);
  } else {
    let isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new SigninAuthError('Incorrect Password', 401);
    } else {
      let token = await jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role,
          experiments: user.experiments,
        },
        tokenSecret,
        { expiresIn: '6h' }
      );
      if (!token) {
        throw new Error('Internal Server Error', 500);
      } else {
        let { password, ...rest } = user.toObject();
        return { token, user: rest, role: user.role };
      }
    }
  }
};

module.exports = { signup, signin };

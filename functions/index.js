const otp = require('./src/otp');
const support = require('./src/support');
const avatar = require('./src/avatar');
const leaderboards = require('./src/leaderboards');
const admin = require('./src/admin');
const games = require('./src/games');
const registration = require('./src/registration');
const achievements = require('./src/achievements');
const friends = require('./src/friends');
const passwordReset = require('./src/passwordReset');

module.exports = {
  ...otp,
  ...support,
  ...avatar,
  ...leaderboards,
  ...admin,
  ...games,
  ...registration,
  ...achievements,
  ...friends,
  ...passwordReset,
};

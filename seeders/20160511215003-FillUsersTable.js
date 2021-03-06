'use strict';

var crypto = require('crypto');

function encryptPassword(password, salt){
  return crypto.createHmac('sha1', salt).update(password).digest('hex');
};

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Users', [
      { username: 'admin',
        password: encryptPassword('1234', 'aaaa'),
        salt: 'aaaa',
        isAdmin: true,
        createdAt: new Date(), updatedAt: new Date() },
      { username: 'pepedders',
        password: encryptPassword('4567', 'bbbb'),
        salt: 'bbbb',
        isAdmin: false,
        createdAt: new Date(), updatedAt: new Date() }
    ]);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {});
  }
};

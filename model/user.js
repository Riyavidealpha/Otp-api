// models/user.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/config');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  // Add other user fields here
});

module.exports = User;

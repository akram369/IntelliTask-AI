const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed'),
    defaultValue: 'pending'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  context: {
    type: DataTypes.ENUM('work', 'personal', 'study', 'other'),
    defaultValue: 'other'
  },
  priorityScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  goalId: {
    type: DataTypes.UUID,
    allowNull: true
  }
});

module.exports = Task;

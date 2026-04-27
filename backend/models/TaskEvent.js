const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TaskEvent = sequelize.define('TaskEvent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('TASK_CREATED', 'TASK_COMPLETED', 'TASK_DELETED'),
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  taskId: {
    type: DataTypes.UUID,
    allowNull: true // Might be null if the task itself is deleted
  }
});

module.exports = TaskEvent;

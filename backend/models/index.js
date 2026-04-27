const User = require('./User');
const Task = require('./Task');
const TaskEvent = require('./TaskEvent');
const Goal = require('./Goal');

// User Relationships
User.hasMany(Task, { foreignKey: 'userId', onDelete: 'CASCADE' });
Task.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(TaskEvent, { foreignKey: 'userId', onDelete: 'CASCADE' });
TaskEvent.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Goal, { foreignKey: 'userId', onDelete: 'CASCADE' });
Goal.belongsTo(User, { foreignKey: 'userId' });

// Goal & Task Relationships
Goal.hasMany(Task, { foreignKey: 'goalId', onDelete: 'SET NULL' });
Task.belongsTo(Goal, { foreignKey: 'goalId' });

module.exports = {
  User,
  Task,
  TaskEvent,
  Goal
};

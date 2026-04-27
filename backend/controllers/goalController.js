const { Goal, Task } = require('../models');

// @desc    Create a new goal
exports.createGoal = async (req, res) => {
  try {
    const goal = await Goal.create({ ...req.body, userId: req.user.id });
    res.status(201).json(goal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all goals for user with progress
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.findAll({ where: { userId: req.user.id } });
    
    const goalsWithProgress = await Promise.all(goals.map(async (goal) => {
      const tasks = await Task.findAll({ where: { goalId: goal.id } });
      const completed = tasks.filter(t => t.status === 'completed').length;
      const total = tasks.length;
      const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
      
      return { ...goal.toJSON(), progress, totalTasks: total };
    }));
    
    res.json(goalsWithProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a goal
exports.updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    
    await goal.update(req.body);
    res.json(goal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a goal
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    
    await goal.destroy();
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const { Task } = require('../models');
const taskService = require('../services/taskService');
const insightService = require('../services/insightService');
const decisionEngine = require('../services/decisionEngine');

// @desc    Get all tasks for logged in user (Adaptive Order)
exports.getTasks = async (req, res) => {
  try {
    const tasks = await decisionEngine.getAdaptiveOrder(req.user.id);

    // Enrich with dynamic priority score AND risk level AND explanation
    const enrichedTasks = tasks.map(task => {
      const taskJson = task.toJSON();
      const meta = taskService.calculatePriorityAndExplain(taskJson);
      return {
        ...taskJson,
        priorityScore: meta.score,
        explanation: meta.explanation,
        riskLevel: taskService.calculateRisk(taskJson)
      };
    });

    res.json(enrichedTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get real-time nudges
exports.getNudges = async (req, res) => {
  try {
    const nudges = await decisionEngine.getNudges(req.user.id);
    res.json(nudges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get behavioral insights
exports.getInsights = async (req, res) => {
  try {
    const insights = await insightService.getUserInsights(req.user.id);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get the Next Best Task
exports.getNextTask = async (req, res) => {
  try {
    const nextTask = await taskService.getNextBestTask(req.user.id);
    res.json(nextTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new task
exports.createTask = async (req, res) => {
  const { title, deadline, context } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ message: 'Please provide a title' });
    }

    const task = await Task.create({
      title,
      userId: req.user.id,
      deadline,
      context
    });

    // Log behavioral event
    await taskService.logEvent('TASK_CREATED', req.user.id, task.id);

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task status or details
exports.updateTask = async (req, res) => {
  const { status, title, deadline, context } = req.body;

  try {
    const task = await Task.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const oldStatus = task.status;
    
    task.status = status || task.status;
    task.title = title || task.title;
    task.deadline = deadline !== undefined ? deadline : task.deadline;
    task.context = context || task.context;
    
    await task.save();

    // Log completion event
    if (oldStatus === 'pending' && status === 'completed') {
      await taskService.logEvent('TASK_COMPLETED', req.user.id, task.id);
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const taskId = task.id;
    await task.destroy();

    // Log deletion event
    await taskService.logEvent('TASK_DELETED', req.user.id, taskId);

    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

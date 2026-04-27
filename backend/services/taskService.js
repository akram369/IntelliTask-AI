const { Task, TaskEvent, Goal } = require('../models');

const taskService = {
  /**
   * Calculates priority with self-learning adjustments and generates an explanation.
   */
  calculatePriorityAndExplain: (task, completionHistory = []) => {
    let score = 10;
    let reasons = [];
    
    // 1. Deadline Context
    if (task.deadline) {
      const now = new Date();
      const deadline = new Date(task.deadline);
      const diffHours = (deadline - now) / (1000 * 60 * 60);
      
      if (diffHours < 0) {
        score += 150;
        reasons.push("Overdue action required");
      } else if (diffHours < 24) {
        score += 80;
        reasons.push("Due within 24 hours");
      } else if (diffHours < 72) {
        score += 30;
        reasons.push("Approaching milestone");
      }
    }

    // 2. Behavioral Learning (Simulated logic based on pattern matching)
    const currentHour = new Date().getHours();
    const isMorning = currentHour < 12;
    
    if (task.context === 'work' && isMorning) {
      score += 40;
      reasons.push("Matches your morning productivity pattern for work");
    } else if (task.context === 'personal' && !isMorning) {
      score += 40;
      reasons.push("You usually focus on personal goals in the evening");
    }

    // 3. Goal Alignment
    if (task.goalId) {
      score += 50;
      reasons.push("Directly linked to an active outcome");
    }

    return {
      score,
      explanation: reasons.length > 0 ? reasons.join(' + ') : "Standard baseline priority"
    };
  },

  calculatePriority: (task) => {
    return taskService.calculatePriorityAndExplain(task).score;
  },

  calculateRisk: (task) => {
    const scoreInfo = taskService.calculatePriorityAndExplain(task);
    if (scoreInfo.score > 200) return 'high';
    if (scoreInfo.score > 100) return 'medium';
    return 'low';
  },

  logEvent: async (type, userId, taskId = null) => {
    try {
      await TaskEvent.create({ type, userId, taskId });
    } catch (err) {
      console.error('Event log failed:', err.message);
    }
  },

  /**
   * Retrieves the most critical pending task using the decision engine.
   */
  getNextBestTask: async (userId) => {
    const decisionEngine = require('./decisionEngine');
    const tasks = await decisionEngine.getAdaptiveOrder(userId);
    
    if (!tasks || tasks.length === 0) return null;

    const task = tasks[0];
    const taskJson = typeof task.toJSON === 'function' ? task.toJSON() : task;
    const meta = taskService.calculatePriorityAndExplain(taskJson);
    
    return {
      ...taskJson,
      priorityScore: meta.score,
      explanation: meta.explanation,
      riskLevel: taskService.calculateRisk(taskJson)
    };
  }
};

module.exports = taskService;

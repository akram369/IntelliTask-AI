const { Task, TaskEvent } = require('../models');
const { Op } = require('sequelize');

const decisionEngine = {
  /**
   * Calculates the optimal sequence of tasks based on productivity windows.
   */
  getAdaptiveOrder: async (userId) => {
    const tasks = await Task.findAll({
      where: { userId }
    });

    const now = new Date();
    const currentHour = now.getHours();

    // Productivity Windows (Simulated logic based on common behavior)
    // Morning (6-11): Work context peak
    // Evening (18-22): Personal context peak
    
    return tasks.sort((a, b) => {
      // Completed tasks go to the bottom
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (b.status === 'completed' && a.status !== 'completed') return -1;
      
      let scoreA = 0;
      let scoreB = 0;

      // 1. Time-of-Day Context Bonus
      if (currentHour >= 6 && currentHour <= 11) {
        if (a.context === 'work') scoreA += 50;
        if (b.context === 'work') scoreB += 50;
      } else if (currentHour >= 18 && currentHour <= 22) {
        if (a.context === 'personal') scoreA += 50;
        if (b.context === 'personal') scoreB += 50;
      }

      // 2. Deadline Urgency (Static weight)
      if (a.deadline && new Date(a.deadline) < now) scoreA += 100;
      if (b.deadline && new Date(b.deadline) < now) scoreB += 100;

      return scoreB - scoreA;
    });
  },

  /**
   * Generates real-time contextual nudges.
   */
  getNudges: async (userId) => {
    const highRiskTask = await Task.findOne({
      where: { 
        userId, 
        status: 'pending',
        deadline: { [Op.lt]: new Date(Date.now() + 12 * 60 * 60 * 1000) } // Due within 12h
      }
    });

    const nudges = [];
    if (highRiskTask) {
      nudges.push({
        type: 'RISK_NUDGE',
        message: `“${highRiskTask.title}” is entering a high-risk zone. Tackle it now?`
      });
    }

    return nudges;
  }
};

module.exports = decisionEngine;

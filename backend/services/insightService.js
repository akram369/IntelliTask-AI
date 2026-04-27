const { TaskEvent, Task } = require('../models');
const { Op } = require('sequelize');

const insightService = {
  /**
   * Generates behavioral insights for a user based on their task history.
   */
  getUserInsights: async (userId) => {
    const events = await TaskEvent.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    const insights = [];
    
    // 1. Completion Time Trend
    const completions = events.filter(e => e.type === 'TASK_COMPLETED');
    if (completions.length > 3) {
      const hours = completions.map(e => new Date(e.createdAt).getHours());
      const avgHour = hours.reduce((a, b) => a + b, 0) / hours.length;
      
      if (avgHour < 12) insights.push("🔥 You're a morning warrior. Most tasks are completed early.");
      else if (avgHour > 18) insights.push("🌙 Your peak performance usually happens in the evening.");
      else insights.push("⚡ You're most productive during core business hours.");
    }

    // 2. Category Behavior (Simulated based on pending task distribution)
    const delayedPersonal = await Task.count({
      where: {
        userId,
        context: 'personal',
        status: 'pending',
        deadline: { [Op.lt]: new Date() }
      }
    });

    if (delayedPersonal > 1) {
       insights.push("⚠️ Personal objectives tend to drift. Consider tackling them in Focus Mode.");
    }

    // 3. Daily Streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completedToday = await TaskEvent.count({
      where: {
        userId,
        type: 'TASK_COMPLETED',
        createdAt: { [Op.gte]: today }
      }
    });

    return {
      tips: insights.slice(0, 2),
      streak: completedToday
    };
  }
};

module.exports = insightService;

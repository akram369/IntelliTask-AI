const { Task, TaskEvent } = require('../models');
const { Op } = require('sequelize');

// @desc    Get weekly analytics reflection
exports.getWeeklyReflection = async (req, res) => {
  try {
    const userId = req.user.id;
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // 1. Completion count
    const completedCount = await Task.count({
      where: { 
        userId, 
        status: 'completed',
        updatedAt: { [Op.gte]: lastWeek }
      }
    });

    // 2. Peak productivity time
    const events = await TaskEvent.findAll({
      where: { 
        userId, 
        type: 'TASK_COMPLETED',
        createdAt: { [Op.gte]: lastWeek }
      }
    });

    let peakTime = "Standard";
    if (events.length > 0) {
      const hours = events.map(e => new Date(e.createdAt).getHours());
      const avgHour = hours.reduce((a, b) => a + b, 0) / hours.length;
      peakTime = avgHour < 12 ? "Early Morning" : avgHour < 17 ? "Afternoon" : "Evening";
    }

    res.json({
      completedThisWeek: completedCount,
      peakWindow: peakTime,
      momentum: completedCount > 5 ? "Rising" : "Steady",
      insights: [
        `You've secured ${completedCount} objectives this week.`,
        `Your focus peaks in the ${peakTime}.`
      ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

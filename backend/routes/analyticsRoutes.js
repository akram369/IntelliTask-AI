const express = require('express');
const router = express.Router();
const { getWeeklyReflection } = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', getWeeklyReflection);

module.exports = router;

const express = require('express');
const router = express.Router();
const controller = require('../controllers/pomodoroController');

router.get('/sessions', controller.getAll);     // GET /api/v1/pomodoro/sessions
router.post('/session', controller.create);     // POST /api/v1/pomodoro/session
router.delete('/sessions', controller.removeAll); // DELETE all sessions (optional)

module.exports = router;

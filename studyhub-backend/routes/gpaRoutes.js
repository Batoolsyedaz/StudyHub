const express = require('express');
const router = express.Router();
const controller = require('../controllers/gpaController');

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.delete('/:id', controller.remove);

module.exports = router;

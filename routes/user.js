const express = require('express');

const router = express.Router();
const userController = require('../controllers/user');

router.post('/updateUser', userController.updateUser);
router.post('/:userId', userController.getUser);

module.exports = router;

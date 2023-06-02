const router = require('express').Router();
const {postMessage, getMessages, deleteMessages} = require('../controllers/message')

router.route('/:id').post(postMessage).get(getMessages).delete(deleteMessages)

module.exports = router
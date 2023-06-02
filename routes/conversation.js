const router = require('express').Router();
const { getOrAddConvo, getAllConvo , createGroup , addMember , removeMember ,  deleteConvo ,updateGroup} = require('../controllers/conversation')

router.route('/').post(getOrAddConvo).get(getAllConvo).delete(deleteConvo)
router.route('/group').post(createGroup)
router.route('/group/:id').post(addMember).delete(removeMember).patch(updateGroup)

module.exports = router
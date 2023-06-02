const router = require('express').Router();
const {registerUser , loginUser , changePass, getUser , searchUser, updateUser} = require('../controllers/user')
const authorization =  require('../middleware/auth')

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/changePass').post(changePass )
router.route('/').get(authorization , getUser).patch(authorization , updateUser)
router.route('/multi').get(authorization , searchUser)


module.exports = router
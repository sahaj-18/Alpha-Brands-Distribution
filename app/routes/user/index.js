const express = require('express')
const router = express.Router()

const user = require('../../controllers/user/user')

router.post('/api/user/userRegistartion', user.userRegistartion)
router.post('/api/user/userLogin',user.userLogin)
router.post('/api/user/userLogout',user.userLogout)
router.post('/api/user/userUpdate',user.userUpdate)
router.post('/api/user/gteUserDetail',user.gteUserDetail)
router.post('/api/user/forgotPassword',user.forgotPassword)
router.post('/api/user/verificationOfOtp',user.verificationOfOtp)
router.post('/api/user/setNewPassword',user.setNewPassword)

module.exports = router
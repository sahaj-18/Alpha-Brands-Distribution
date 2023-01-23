require('../../utils/messageCode')
require('../../utils/errorCode')
require('../../utils/constant')
const user = require('../../models/user')
const utils = require('../../utils/utils')
const User = require('mongoose').model('user')
const Email = require('mongoose').model('emailDetail')
const Setting = require('mongoose').model('setting')

exports.userRegistartion = async (req, res) => {
    try {
        await utils.checkRequestParams(req.body, [{ name: 'firstName', type: 'string' }, { name: 'email', type: 'string' }, { name: 'password', type: 'string' }, { name: 'phone', type: 'string' }, { name: 'type', type: 'string' }])
        const requestDataBody = req.body
        const findByEmail = await User.findOne({ email: requestDataBody.email })
        if (findByEmail) throw ({ errorCode: ADMIN_ERROR_CODE.EMAIL_ALREADY_REGISTERED })
        const findByPhone = await User.findOne({ phone: requestDataBody.phone })
        if (findByPhone) throw ({ errorCode: USER_ERROR_CODE.PHONE_ALREADY_REGISTERED })
        if (!(requestDataBody.password.length >= 6)) throw ({ errorCode: USER_ERROR_CODE.PASSWORD_MUST_BE_SIX_CHARACTER_LONG })
        requestDataBody.password = utils.encryptPassword(requestDataBody.password)
        requestDataBody.firstName = requestDataBody.firstName.trim().toLowerCase(),
            requestDataBody.lastName = requestDataBody.lastName.trim().toLowerCase(),
            requestDataBody.email = requestDataBody.email.trim().toLowerCase()
        const newUser = new User(requestDataBody)
        const imageFile = req.files
        if (imageFile !== undefined && imageFile.length > 0) {
            const imageName = newUser._id + utils.generateServerToken(4)
            const url = utils.getStoreImageFolderPath(FOLDER_NAME.USER_PROFILES) + imageName + FILE_EXTENSION.USER
            newUser.profile = url
            utils.storeImageToFolder(imageFile[0].path, imageName + FILE_EXTENSION.USER, FOLDER_NAME.USER_PROFILES)
        }
        const emailTemplate = await Email.findOne({templateUniqueId : 1})
        utils.sendEmails(newUser.email,emailTemplate.emailTitle,emailTemplate.emailContent)
        const addUser = await newUser.save()
        if (!addUser) throw ({ errorCode: USER_ERROR_CODE.USER_NOT_SAVED })
        return res.json({ success: true, ...utils.middleware(req.headers.lang, USER_MESSAGE_CODE.USER_REGISTARTION, true), responseData: addUser })
    } catch (error) {
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
}

exports.userLogin = async (req, res) => {
    try {
        await utils.checkRequestParams(req.body, [{ name: 'password', type: 'string' }])
        const requestDataBody = req.body
        let query = {}
        if (requestDataBody.email) {
            query = { email: requestDataBody.email }
        } else if (requestDataBody.phone) {
            query = { phone: requestDataBody.phone }
        }
        const matchedUser = await User.findOne(query)
        if (!matchedUser) throw ({ errorCode: USER_ERROR_CODE.USER_DATA_NOT_FOUND })
        if (matchedUser.password !== utils.encryptPassword(requestDataBody.password)) throw ({ errorCode: USER_ERROR_CODE.INVALID_PASSWORD })
        const jwtToken = utils.generateJwtToken(matchedUser.email)
        const user = await User.findByIdAndUpdate(matchedUser._id, { jwtToken: jwtToken }, { new: true })
        return res.json({ success: true, ...utils.middleware(req.headers.lang, USER_MESSAGE_CODE.LOGIN_SUCCESSFULLY, true), responseData: user })
    } catch (error) {
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
}

exports.userLogout = async (req, res) => {
    try {
        await utils.checkRequestParams(req.body, [{ name: 'jwtToken', type: 'string' }, { name: 'userId', type: 'string' }])
        const requestDataBody = req.body
        const user = await User.findOne({ _id: requestDataBody.userId })
        if (!user) throw ({ errorCode: USER_ERROR_CODE.USER_DATA_NOT_FOUND })
        if (requestDataBody.jwtToken !== user.jwtToken) throw ({ errorCode: ADMIN_ERROR_CODE.INVALID_AUTH_TOKEN })
        user.jwtToken = ''
        await user.save()
        return res.json({ success: true, ...utils.middleware(req.headers.lang, ADMIN_MESSAGE_CODE.LOGGED_OUT_SUCCESSFULLY, true) })
    } catch (error) {
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
}

exports.userUpdate = async (req, res) => {
    try {
        await utils.checkRequestParams(req.body, [{ name: 'jwtToken', type: 'string' }, { name: 'userId', type: 'string' }])
        const requestDataBody = req.body
        const matchedUser = await User.findOne({ _id: requestDataBody.userId })
        if (!matchedUser) throw ({ errorCode: USER_ERROR_CODE.USER_DATA_NOT_FOUND })
        if(requestDataBody.email){
            const userEmailDetail = await User.findOne({ _id: { $ne: requestDataBody.userId }, email: requestDataBody.email })
            if (userEmailDetail) throw ({ errorCode: ADMIN_ERROR_CODE.EMAIL_ALREADY_REGISTERED })
        }
        if(requestDataBody.phone){
            const userPhoneDetail = await User.findOne({ _id: { $ne: requestDataBody.userId }, phone: requestDataBody.phone })
            if (userPhoneDetail) throw ({ errorCode: USER_ERROR_CODE.PHONE_ALREADY_REGISTERED })
        }
        if (requestDataBody.jwtToken !== null && matchedUser.jwtToken !== requestDataBody.jwtToken) throw ({ errorCode: ADMIN_ERROR_CODE.INVALID_AUTH_TOKEN })
        if(requestDataBody.password){
            requestDataBody.password = utils.encryptPassword(requestDataBody.password)
        }
        const imageFile = req.files
        if (imageFile !== undefined && imageFile.length > 0) {
			utils.deleteImageFromFolder(matchedUser.profile, FOLDER_NAME.USER_PROFILES)
			const imageName = matchedUser._id + utils.generateServerToken(4)
			const url = utils.getStoreImageFolderPath(FOLDER_NAME.USER_PROFILES) + imageName + FILE_EXTENSION.USER
			requestDataBody.profile = url
			utils.storeImageToFolder(imageFile[0].path, imageName + FILE_EXTENSION.USER, FOLDER_NAME.USER_PROFILES)
		}
        const updatedUser = await User.findOneAndUpdate(requestDataBody.userId, requestDataBody, { new: true })
		if (!updatedUser) throw ({ errorCode: USER_ERROR_CODE.UPDATE_FAILED })
        return res.json({ success: true, ...utils.middleware(req.headers.lang, USER_MESSAGE_CODE.UPDATED_SUCCESSFULLY, true), responseData: updatedUser })
    } catch (error) {
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
}

exports.gteUserDetail = async (req, res) => {
    try{
        await utils.checkRequestParams(req.body, [{ name: 'userId', type: 'string' }])
        const requestDataBody = req.body
        const userDetail = await User.findById(requestDataBody.userId)
        if(!userDetail) throw ({ errorCode: USER_ERROR_CODE.USER_DATA_NOT_FOUND })
        return res.json({ success: true, ...utils.middleware(req.headers.lang, USER_MESSAGE_CODE.USER_DETAIL_SUCCEED, true), responseData: userDetail })
    } catch (error) {
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
}

exports.forgotPassword = async (req,res) => {
    try {
        await utils.checkRequestParams(req.body, [{ name: 'email', type: 'string' }])
        const requestDataBody = req.body
        const userDetail = await User.findOne({email:requestDataBody.email})
        if(!userDetail) throw ({ errorCode: USER_ERROR_CODE.USER_DATA_NOT_FOUND })
        let otp = utils.generateOtp()
        userDetail.otp = otp
        const emailTemplate = await Email.findOne({templateUniqueId : 4})
        const Settings = Setting.findOne({})
	    let nodemailer = require('nodemailer');
	    let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
            user: 'letscreate107@gmail.com',
            pass: 'tmlycdtvglaizbhy'
            },
            port:465,
            host:'smtp.gmail.com'
        });
        let mailOptions = {
            from: 'letscreate107@gmail.com',
            to: userDetail.email,
            subject: emailTemplate.emailTitle,
            text: emailTemplate.emailContent + ' ' + otp 
        };
        transporter.sendMail(mailOptions, async function (error, info){
            if (error) {
                return res.json({success: false , errorDescription : error })
            } else {
                await userDetail.save()
                return res.json({ success: true, ...utils.middleware(req.headers.lang, USER_MESSAGE_CODE.OTP_SENT_SUCCESSFULLY, true), responseData: userDetail._id })
            }
        });
    } catch (error) {
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
}

exports.verificationOfOtp = async (req , res) => {
    try {
        await utils.checkRequestParams(req.body, [{ name: 'userId', type: 'string' },{ name: 'otp', type: 'string' }])
        const requestDataBody = req.body
        const userDetail = await User.findById(requestDataBody.userId)
        if(!userDetail) throw ({ errorCode: USER_ERROR_CODE.USER_DATA_NOT_FOUND })
        if(requestDataBody.otp !== userDetail.otp) throw ({ errorCode: USER_ERROR_CODE.INVALID_OTP })
        userDetail.otp = ''
        await userDetail.save()
        return res.json({ success: true, ...utils.middleware(req.headers.lang, USER_MESSAGE_CODE.OTP_VERIFY_SUCCESSFULLY, true),responseData: userDetail._id})
    } catch (error) {
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
}

exports.setNewPassword = async (req , res) => {
    try {
        await utils.checkRequestParams(req.body, [{ name: 'userId', type: 'string' },{ name: 'newPassword', type: 'string' }])
        const requestDataBody = req.body
        const userDetail = await User.findById(requestDataBody.userId)
        if(!userDetail) throw ({ errorCode: USER_ERROR_CODE.USER_DATA_NOT_FOUND })
        userDetail.password = utils.encryptPassword(requestDataBody.newPassword)
        const savePassword = await userDetail.save()
        if(!savePassword) throw ({ errorCode: USER_ERROR_CODE.PASSWORD_NOT_SAVED })
        const emailTemplate = await Email.findOne({templateUniqueId : 5})
        utils.sendEmails(userDetail.email,emailTemplate.emailTitle,emailTemplate.emailContent)
        return res.json({ success: true, ...utils.middleware(req.headers.lang, USER_MESSAGE_CODE.PASSWORD_SAVED, true)})
    } catch (error) {
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
}
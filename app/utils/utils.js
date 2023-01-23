const myUtils = require('./utils')
require('../utils/constant')
require('./errorCode')
require('./messageCode')
const json = require('../utils/en.json')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const Setting = require('../models/admin/setting')

exports.checkRequestParams = function (requestDataBody, paramsArray) {
    let missingParam = ''
    let isMissing = false
    let invalidParam = ''
    let isInvalidParam = false
    paramsArray.forEach(function (param) {
        if (requestDataBody[param.name] === undefined) {
            missingParam = param.name
            isMissing = true
        } else {
            if (param.type && typeof requestDataBody[param.name] !== param.type) {
                isInvalidParam = true
                invalidParam = param.name
            }
        }
    })

    if (isMissing) throw ({ errorDescription: missingParam + ' parameter missing' })
    else if (isInvalidParam) throw ({ errorDescription: invalidParam + ' parameter invalid' })
}

exports.catchBlockErrors = function (lang, error, res) {
    console.log(error)
    if (error.errorCode || error.errorDescription) {
        const response = error.errorCode ? { success: false, ...myUtils.middleware(lang, error.errorCode, false) } : { success: false, errorDescription: error.errorDescription, errorCode: error.errorCode }
        return res.json(response)
    } return res.json({
        success: false,
        ...myUtils.middleware(lang, ERROR_CODE.SOMETHING_WENT_WRONG, false)
    })
}

exports.middleware = function (lang = 0, response, isSuccess) {
    try {
        const langCode = 'en'
        if (isSuccess) json[langCode] !== undefined ? string = json[langCode].successCode[response] : string = json.en.successCode[response]
        else json[langCode] !== undefined ? string = json[langCode].errorCode[response] : string = json.en.errorCode[response]
        return {
            description: string,
            code: response
        }
    } catch (error) {
        console.log(error)
    }
}

exports.encryptPassword = function (password) {
	const crypto = require('crypto')
	try {
		return crypto.createHash('md5').update(password).digest('hex')
	} catch (error) {
		console.error(error)
	}
}

exports.generateJwtToken = function (email) {
	const payload = { subject: email }
	const token = jwt.sign(payload, 'ALPHABRANDSDISTRUBUTION')
	return token
}

exports.generateServerToken = function (length) {
	try {
		if (typeof length === 'undefined') { length = 32 }
		let token = ''
		const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
		for (let i = 0; i < length; i++) { token += possible.charAt(Math.floor(Math.random() * possible.length)) }
		return token
	} catch (error) {
		console.error(error)
	}
}

exports.getStoreImageFolderPath = function (id) {
	return myUtils.getImageFolderName(id)
}

exports.getImageFolderName = function (id) {
	switch (id) {
	case FOLDER_NAME.USER_PROFILES:
		return 'userProfiles/'
	case FOLDER_NAME.EMAIL_IMAGES:
		return 'emailImages/'
	case FOLDER_NAME.LANGUAGES:
		return 'languages/'
	case FOLDER_NAME.PRODUCT_IMAGES:
		return 'productImages/'
	default:
		break
	}
}

exports.getSaveImageFolderPath = function (id) {
	return './uploads/' + myUtils.getImageFolderName(id)
}

exports.storeImageToFolder = function (localImagePath, imageName, id) {
	const fileNewPath = myUtils.getSaveImageFolderPath(id) + imageName
	fs.readFile(localImagePath, function (error, data) {
		fs.writeFile(fileNewPath, data, 'binary', function (error) {
			if (error) console.log('Save file : ' + error)
			else if (fs.existsSync(localImagePath)) fs.unlinkSync(localImagePath)
		})
	})
}

exports.deleteImageFromFolder = function (oldImage, id) {
	if (oldImage !== '' || oldImage !== null) {
		const oldFineName = oldImage.split('/')
		const oldFilePath = myUtils.getSaveImageFolderPath(id) + oldFineName[1]

		if (fs.existsSync(oldFilePath)) {
			fs.unlink(oldFilePath, function (error, file) {
				if (error) console.error(error)
				else console.log('successfully remove image')
			})
		}
	}
}
exports.generateOtp = function () {
	try {
		let otpCode = ''
		otpCode = Math.floor(100000 + Math.random() * 900000)
		return otpCode
	} catch (error) {
		console.log(error)
	}
}


exports.sendEmails = function (receiverEmail,subject,text) {
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
		to: receiverEmail,
		subject: subject,
		text: text
	  };
	  transporter.sendMail(mailOptions, function (error, info){
		if (error) {
			console.log(error);
		} else {
			
		}
	  });
}
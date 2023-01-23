require('../../utils/errorCode')
require('../../utils/messageCode')
require('../../utils/constant')
const utils = require('../../utils/utils')
const Setting = require('mongoose').model('setting')

exports.getSettingDetails = async(req,res) => {
    try {
        const settingDetails = await Setting.findOne()
        if(!settingDetails) throw ({ errorCode: ERROR_CODE.DETAILS_NOT_FOUND })
        return res.json({ success: true, ...utils.middleware(req.headers.lang, SETTING_MESSAGE_CODE.SETTING_LIST_SUCCESSFULLY, true), responseData: settingDetails })
    } catch (error) {
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
} 

exports.editSettingDetails = async(req,res) => {
    try {
        const requestDataBody = req.body
        const settingFinder = await Setting.findOne({})
		if (!settingFinder) throw ({ errorCode: ERROR_CODE.DETAIL_NOT_FOUND })
        const updateSettingDeatils = await Setting.findByIdAndUpdate((settingFinder._id),requestDataBody,{new:true})
        if(!updateSettingDeatils) throw ({ errorCode: SETTING_ERROR_CODE.SETTING_UPDATION_FAILED })
        return res.json({ success: true, ...utils.middleware(req.headers.lang, SETTING_MESSAGE_CODE.SETTING_UPDATED, true), responseData: updateSettingDeatils })
    } catch (error) {
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
}

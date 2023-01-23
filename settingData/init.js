let mongoose = require('mongoose')
mongoose = require('../config/mongoose')
db = mongoose()

const initialData = async () => {
    const Setting = require('mongoose').model('setting')
	const settingData = require('./settings.json')
	const settingDetail = await Setting.findOne({})

	if (!settingDetail) {
		const setting = new Setting(settingData)
		await setting.save()
	}


    const Email = require('mongoose').model('emailDetail')
	const emailData = require('./emailDetails.json')
	const emailDetails = await Email.findOne({})

	if (!emailDetails) {
		Email.create(emailData, function (_err, jellybean, snickers) { })
	}
}

initialData()
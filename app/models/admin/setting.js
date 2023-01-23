const mongoose = require('mongoose')
const schema = mongoose.Schema
const autoIncrement = require('mongoose-auto-increment')
autoIncrement.initialize(mongoose.connection)

const setting = schema({
	uniqueId: Number,
	adminEmail: { type: String, default: '' },
	adminPhoneNumber: { type: String, default: '' },
	adminContactEmail: { type: String, default: '' },
	adminContactPhoneNumber: { type: String, default: '' },
	databaseURL: { type: String, default: '' },
	appName: { type: String, default: '' },
	adminBaseUrl: { type: String, default: '' },
	userBaseUrl: { type: String, default: '' },
	minimumPhoneNumberLength: { type: Number, default: 8 },
	maximumPhoneNumberLength: { type: Number, default: 12 },
	created_at: {
		type: Date,
		default: Date.now
	},
	updated_at: {
		type: Date,
		default: Date.now
	}
})

setting.plugin(autoIncrement.plugin, { model: 'setting', field: 'uniqueId', startAt: 1, incrementBy: 1 })
module.exports = mongoose.model('setting', setting)

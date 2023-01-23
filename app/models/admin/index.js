const mongoose = require('mongoose')
const schema = mongoose.Schema
const autoIncrement = require('mongoose-auto-increment')
autoIncrement.initialize(mongoose.connection)

const admin = schema({
	uniqueId: Number,
	adminName: { type: String, default: '' },
	password: { type: String, default: '' },
	email: { type: String, default: '' },
	otp: { type: String, default: '' },
	jwtToken: { type: String, default: '' },
	created_at: {
		type: Date,
		default: Date.now
	},
	updated_at: {
		type: Date,
		default: Date.now
	}

})

admin.plugin(autoIncrement.plugin, { model: 'admin', field: 'uniqueId', startAt: 1, incrementBy: 1 })
module.exports = mongoose.model('admin', admin)

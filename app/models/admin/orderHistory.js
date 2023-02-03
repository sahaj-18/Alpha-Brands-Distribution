const mongoose = require('mongoose')
const schema = mongoose.Schema
const autoIncrement = require('mongoose-auto-increment')
autoIncrement.initialize(mongoose.connection)
const orderHistory = schema({
	uniqueId: Number,
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
	items: {type : Array , "default" : []},
    profile: { type: String, default: '' },
    total: { type: String, default: '' },
    created_at: {
		type: Date,
		default: Date.now
	},
	updated_at: {
		type: Date,
		default: Date.now
	}
})

orderHistory.plugin(autoIncrement.plugin, { model: 'orderHistory', field: 'uniqueId', startAt: 1, incrementBy: 1 })
module.exports = mongoose.model('orderHistory', orderHistory)
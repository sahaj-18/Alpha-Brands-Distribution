const mongoose = require('mongoose')
const schema = mongoose.Schema
const autoIncrement = require('mongoose-auto-increment')
autoIncrement.initialize(mongoose.connection)

const user = schema({
	uniqueId: Number,
	firstName: { type: String, default: '' },
    lastName: {type: String, default: ''},
    email: {type: String, default: ''},
    phone: {type: String, default: ''},
	password: { type: String, default: '' },
	otp: { type: String, default: '' },
	jwtToken: { type: String, default: '' },
    type: {type: Number, default:1},
    taxId: {type: String,default:''},
	profile: {type: String, default: ''},
	isApproved: {type : Boolean,default: false},
	cartId: { type: schema.Types.ObjectId,default:null},
	address: { type: String, default: '' },
	customerId: { type: String, default: '' },
	paymentIntentId: { type: String, default: '' },
	created_at: {
		type: Date,
		default: Date.now
	},
	updated_at: {
		type: Date,
		default: Date.now
	}

})

user.plugin(autoIncrement.plugin, { model: 'user', field: 'uniqueId', startAt: 1, incrementBy: 1 })
module.exports = mongoose.model('user', user)

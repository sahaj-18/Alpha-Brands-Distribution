const mongoose = require('mongoose')
const schema = mongoose.Schema

const autoIncrement = require('mongoose-auto-increment')
autoIncrement.initialize(mongoose.connection)

const card = schema({
	uniqueId: Number,
	cardId: { type: String, default: '' },
	cardType: { type: String, default: '' },
	tokenId: { type: String, default: '' },
	cardExpiryDate: { type: String, default: '' },
	cardHolderName: { type: String, default: '' },
	userId: { type: schema.Types.ObjectId },
	customerId: { type: String, default: '' },
	paymentId: { type: schema.Types.ObjectId },
	paymentToken: { type: String, default: '' },
	isDefault: { type: Boolean, default: false },
	lastFour: { type: String, default: '' },
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	}
})

card.plugin(autoIncrement.plugin, { model: 'card', field: 'uniqueId', startAt: 1, incrementBy: 1 })
module.exports = mongoose.model('card', card)

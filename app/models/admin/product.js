const mongoose = require('mongoose')
const schema = mongoose.Schema
const autoIncrement = require('mongoose-auto-increment')
autoIncrement.initialize(mongoose.connection)
const product = schema({
	uniqueId: Number,
	productImage: { type: String, default: 'Static/snacks.png' }, 
	productTitle: { type: String, default: '' }, 
	category: { type: String, default: '' }, 
	productDescription: { type: String, default: '' }, 
	priceForRetailer: { type: String, default: '' }, 
	priceForwholesaler: { type: String, default: '' }, 
})

product.plugin(autoIncrement.plugin, { model: 'product', field: 'uniqueId', startAt: 1, incrementBy: 1 })
module.exports = mongoose.model('product', product)
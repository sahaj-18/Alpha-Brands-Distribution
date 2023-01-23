const mongoose = require('mongoose')
const schema = mongoose.Schema
const autoIncrement = require('mongoose-auto-increment')
autoIncrement.initialize(mongoose.connection)
const cart = schema({
	uniqueId: Number,
	userId: { type: schema.Types.ObjectId },
    items: {type : Array , "default" : []},

})


cart.plugin(autoIncrement.plugin, { model: 'cart', field: 'uniqueId', startAt: 1, incrementBy: 1 })
module.exports = mongoose.model('cart', cart)

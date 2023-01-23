const mongoose = require('mongoose')
const schema = mongoose.Schema
const autoIncrement = require('mongoose-auto-increment')
autoIncrement.initialize(mongoose.connection)
const emailDetail = schema({
	uniqueId: Number,
	templateUniqueId: Number,
	emailTitle: String,
	emailContent: String,
	emailAdminInfo: String,
	isSend: { type: Boolean, default: false }
})

emailDetail.index({ uniqueId: 1 }, { background: true })

emailDetail.plugin(autoIncrement.plugin, { model: 'emailDetail', field: 'uniqueId', startAt: 1, incrementBy: 1 })
module.exports = mongoose.model('emailDetail', emailDetail)

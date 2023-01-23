const config = require('./config')
const mongoose = require('mongoose')

module.exports = function () {
	let db
	if (config.db) {
		mongoose.set("strictQuery", false);
		db = mongoose.connect(config.db, {
			useUnifiedTopology: true,
			useNewUrlParser: true
		})
	}

	require('../app/models/admin/index')
	require('../app/models/user/index')
	require('../app/models/admin/setting')
	require('../app/models/admin/email')
	require('../app/models/admin/product')
	require('../app/models/admin/cart')

	return db
}

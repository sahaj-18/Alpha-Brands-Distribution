const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const path = require('path')
const cors = require('cors')
const app = express()
// const middleware = require('./middleware')
app.use(cors())

module.exports = function () {
	app.use([
		express.static(path.join(__dirname, '../uploads')),
		bodyParser.json({ limit: '50mb' }),
		bodyParser.urlencoded({ limit: '50mb', extended: true }),
		multer({ dest: __dirname + '/uploads/' }).any(),
		// middleware
	])

	app.use('', require('../app'))

	return app
}

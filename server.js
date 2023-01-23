let express = require('express')
let mongoose = require('mongoose')


global.settingDetails = {}

const port = process.env.PORT || 5000

const init = async () => {
	require('./config/config')
	mongoose = require('./config/mongoose')
	express = require('./config/express')
	mongoose()
	const app = express()
	const server = require('http').createServer(app)
	// const Setting = require('mongoose').model('setting')
	// const setting = await Setting.findOne({})
	// settingDetails = setting
	server.listen(port, (error) => {
		if (error) console.log(error)
		else console.log('server listen from port no. : ' + `${port}`)
	})
	exports = module.exports = app
}

init()
 
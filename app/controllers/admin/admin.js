require('../../utils/messageCode')
require('../../utils/errorCode')
require('../../utils/constant')
const utils = require('../../utils/utils')
const Admin = require('mongoose').model('admin')
const User = require('mongoose').model('user')


exports.paymentIntent = async (req,res) => {
	try {
		const stripe = require('stripe')('sk_test_51McibOLu6kryVLFNz5u9xGMfKSF63IFBdEhxHv2WqeSOSK6fFQRs4OVZpEtMk2QHkNtLGYHsFfPxtgPVqZHsbrJE00hOOT347g');
		console.log(req.body.amount);
		const paymentIntent = await stripe.paymentIntents.create({
			// amount: 1099,
			amount:req.body.amount,
			currency: 'cad',
		  });
		  const clientSecret = paymentIntent.client_secret
		  return res.json({ success: true, responseData: clientSecret })
	} catch (error) {

	}
}

exports.addAdmin = async (req, res) => {
    try {
        await utils.checkRequestParams(req.body, [{ name: 'adminName', type: 'string' }, { name: 'email', type: 'string' }, { name: 'password', type: 'string' }])
        const requestDataBody = req.body
        const password = requestDataBody.password
        const admin = await Admin.findOne({ email: ((requestDataBody.email).trim()).toLowerCase() })
        if (admin) throw ({ errorCode: ADMIN_ERROR_CODE.EMAIL_ALREADY_REGISTERED })
        const newAdmin = new Admin({
            adminName: requestDataBody.adminName.trim().toLowerCase(),
            email: requestDataBody.email.trim().toLowerCase(),
            password: utils.encryptPassword(password)
        })
		utils.sendEmails(newAdmin.email,'123456')
        const addedAdmin = await newAdmin.save()
        if (!addedAdmin) throw ({ errorCode: ADMIN_ERROR_CODE.ADMIN_NOT_SAVED })
        return res.json({ success: true, ...utils.middleware(req.headers.lang, ADMIN_MESSAGE_CODE.ADMIN_ADDED, true), responseData: addedAdmin._id })
    } catch (error) {
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
}

exports.updateAdmin = async (req, res) => {
	try {
		await utils.checkRequestParams(req.body, [{ name: 'adminId', type: 'string' }])
		const requestDataBody = req.body
		if (requestDataBody.adminName) {
			const adminName = ((requestDataBody.adminName).trim()).toLowerCase()
			requestDataBody.adminName = adminName
		}
		if (requestDataBody.password !== '') {
			const password = requestDataBody.password
			requestDataBody.password = utils.encryptPassword(password)
		}
		if (requestDataBody.email) {
			const admin = await Admin.findOne({ _id: { $ne: requestDataBody.adminId }, email: ((requestDataBody.email).trim()).toLowerCase() })
			if (admin) throw ({ errorCode: ADMIN_ERROR_CODE.EMAIL_ALREADY_REGISTERED })
		}
		const updatedAdmin = await Admin.findOneAndUpdate({ _id: requestDataBody.adminId }, requestDataBody, { new: true })
		if (!updatedAdmin) throw ({ errorCode: USER_ERROR_CODE.UPDATE_FAILED })
		return res.json({ success: true, ...utils.middleware(req.headers.lang, ADMIN_MESSAGE_CODE.UPDATED_SUCCESSFULLY, true) })
	} catch (error) {
		console.log(error)
		utils.catchBlockErrors(req.headers.lang, error, res)
	}
}

exports.getAdminDetail = async (req, res) => {
    try {
        await utils.checkRequestParams(req.body, [{ name: 'adminId', type: 'string' }])
        const admin = await Admin.findById(req.body.adminId)
        if (!admin) throw ({ errorCode: ERROR_CODE.DETAILS_NOT_FOUND })
        return res.json({ success: true, ...utils.middleware(req.headers.lang, ADMIN_MESSAGE_CODE.GET_DETAIL_SUCCESSFULLY, true), responseData: admin })
    } catch (error) {
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
}

exports.adminLogin = async (req, res) => {
    try {
        await utils.checkRequestParams(req.body, [{ name: 'email', type: 'string' }, { name: 'password', type: 'string' }])
        const requestDataBody = req.body
        let admin
        admin = await Admin.findOne({ email: ((requestDataBody.email).trim()).toLowerCase() })
        if (!admin) throw ({ errorCode: ERROR_CODE.DETAILS_NOT_FOUND })
		// if(admin.jwtToken !== '' || admin.jwtToken !== undefined || admin.jwtToken !== null)  throw ({ errorCode: ADMIN_ERROR_CODE.ANOTHER_ACTIVE_SESSSION })
        if ((utils.encryptPassword(requestDataBody.password)) !== admin.password) throw ({ errorCode: ADMIN_ERROR_CODE.INVALID_PASSWORD })

        admin.jwtToken = utils.generateJwtToken(admin.email)
        await admin.save()

        return res.json({ success: true, ...utils.middleware(req.headers.lang, ADMIN_MESSAGE_CODE.LOGGED_IN_SUCCESSFULLY, true), responseData: admin })
    } catch (error) {
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
}

exports.adminLogout = async (req, res) => {
    try {
        await utils.checkRequestParams(req.body, [{ name: 'jwtToken', type: 'string' }, { name: 'adminId', type: 'string' }])

        const requestDataBody = req.body
        const admin = await Admin.findOne({ _id: requestDataBody.adminId })

        if (!admin) throw ({ errorCode: ERROR_CODE.DETAILS_NOT_FOUND })

        if (requestDataBody.jwtToken !== admin.jwtToken) throw ({ errorCode: ADMIN_ERROR_CODE.INVALID_AUTH_TOKEN })

        admin.jwtToken = ''
        await admin.save()

        return res.json({ success: true, ...utils.middleware(req.headers.lang, ADMIN_MESSAGE_CODE.LOGGED_OUT_SUCCESSFULLY, true) })
    } catch (error) {
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
}

exports.adminList = async (req, res) => {
    try {
        await utils.checkRequestParams(req.body, [])
        const requestDataBody = req.body
        const numberOfRecord = Number(requestDataBody.numberOfRecord) || 5
        const page = Number(requestDataBody.page) || 1
        const searchField = requestDataBody.searchField
        let searchValue = requestDataBody.searchValue
        const sort = { $sort: {} }
        sort.$sort.uniqueId = parseInt(1)
        let count = {
            $group: { _id: null, count: { $sum: 1 }, data: { $push: '$data' } }
        }
        const skip = {}
        skip.$skip = page * numberOfRecord - numberOfRecord
        const limit = {}
        limit.$limit = numberOfRecord

        const start = page * numberOfRecord - numberOfRecord
        const end = numberOfRecord

        count = {
            $group: { _id: null, count: { $sum: 1 }, result: { $push: '$$ROOT' } }
        }
        const project1 = {
            $project: { count: 1, data: { $slice: ['$result', start, end] } }
        }

        if (
            (searchField === undefined || searchField === '') &&
            (searchValue === undefined || searchValue === '')
        ) {
            const admins = await Admin.aggregate([
                sort,
                count,
                project1
            ])

            if (admins.length === 0) throw { errorCode: ERROR_CODE.DETAILS_NOT_FOUND }

            return res.json({
                success: true,
                ...utils.middleware(req.headers.lang, ADMIN_MESSAGE_CODE.ADMIN_LIST_SUCCESSFULLY, true),
                responseData: admins[0].data,
                count: admins[0].count
            })
        }
        searchValue = searchValue.replace(/^\s+|\s+$/g, '')
        searchValue = searchValue.replace(/ +(?= )/g, '')
		let search = ''
		if (searchField === 'uniqueId') {
			const query = {}
			query[searchField] = { $eq: Number(searchValue) }
			search = { $match: query }
			
		}else {
			 const query = {}
        query[searchField] = { $regex: new RegExp(searchValue, 'i') }
        search = { $match: query }
		}
        const admins = await Admin.aggregate([search, sort, count, project1])
        if (admins.length === 0) throw ({ errorCode: ERROR_CODE.DETAILS_NOT_FOUND })
        return res.json({
            success: true,
            ...utils.middleware(req.headers.lang, ADMIN_MESSAGE_CODE.ADMIN_LIST_SUCCESSFULLY, true),
            responseData: admins[0].data,
            count: admins[0].count
        })
    } catch (error) {
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
}


exports.deleteAdmin = async (req, res) => {
	try {
		await utils.checkRequestParams(req.body, [{ name: 'adminId', type: 'string' }])
		const admin = await Admin.remove({ _id: req.body.adminId })
		if (!admin) throw ({ errorCode: ERROR_CODE.DETAILS_NOT_FOUND })
		return res.json({ success: true, ...utils.middleware(req.headers.lang, ADMIN_MESSAGE_CODE.ADMIN_DELETED_SUCCESSFULLY, true) })
	} catch (error) {
		utils.catchBlockErrors(req.headers.lang, error, res)
	}
}


exports.userListSearchSort = async (req, res) => {
	try {
		await utils.checkRequestParams(req.body, [])

		const requestDataBody = req.body
		const numberOfRecord = Number(requestDataBody.numberOfRecord) || 5
		const page = Number(requestDataBody.page) || 1
		const searchField = requestDataBody.searchField
		let searchValue = requestDataBody.searchValue
		const userPageType = requestDataBody.userPageType
		let search

		const sort = { $sort: {} }
		sort.$sort.uniqueId = parseInt(-1)
		let count = { $group: { _id: null, count: { $sum: 1 }, data: { $push: '$data' } } }
		const skip = {}
		skip.$skip = (page * numberOfRecord) - numberOfRecord
		const limit = {}
		limit.$limit = numberOfRecord

		let condition = { $match: {} }
		if (userPageType === '1') condition = { $match: { type: { $eq: 1 } } }
		else if (userPageType === '2') condition = { $match: { $and : [{type: { $eq: 2 }},{isApproved:true}] } }
		else if (userPageType === '3') condition = { $match: { $and : [{type: { $eq: 2 }},{isApproved:false}] } }
		
		const userEmailPhoneValidation = {
			$match: {
				$or: [{ email: { $ne: '' } }, { phone: { $ne: '' } }]
			}
		}

		const project = {
			$project: {
				uniqueId: 1,
				firstName: 1,
				lastName: 1,
				userPageType: 1,
				phone:1,
				email: 1,
				profile: 1,
				isApproved: 1,
				createdAt: 1
			}
		}

		const start = (page * numberOfRecord) - numberOfRecord
		const end = numberOfRecord
		count = { $group: { _id: null, count: { $sum: 1 }, result: { $push: '$$ROOT' } } }
		const project1 = { $project: { count: 1, data: { $slice: ['$result', start, end] } } }

		if ((searchField === undefined || searchField === '') && (searchValue === undefined || searchValue === '')) {
			const users = await User.aggregate([condition, project, sort, count, project1])

			if (users.length === 0) throw ({ errorCode: ERROR_CODE.DETAILS_NOT_FOUND })

			return res.json({
				success: true,
				...utils.middleware(req.headers.lang, USER_MESSAGE_CODE.USER_LIST_SUCCESSFULLY, true),
				responseData: users[0].data,
				count: users[0].count
			})
		}

		searchValue = searchValue.replace(/^\s+|\s+$/g, '')
		searchValue = searchValue.replace(/ +(?= )/g, '')

		if (searchField === 'firstName') {
			const query1 = {}
			const query2 = {}
			const query3 = {}
			const query4 = {}
			const query5 = {}
			const query6 = {}
			const fullName = searchValue.split(' ')
			if (typeof fullName[0] === 'undefined' || typeof fullName[1] === 'undefined') {
				query1[searchField] = { $regex: new RegExp(searchValue, 'i') }
				query2.lastName = { $regex: new RegExp(searchValue, 'i') }

				search = { $match: { $or: [query1, query2] } }
			} else {
				query1[searchField] = { $regex: new RegExp(searchValue, 'i') }
				query2.lastName = { $regex: new RegExp(searchValue, 'i') }
				query3[searchField] = { $regex: new RegExp(fullName[0], 'i') }
				query4.lastName = { $regex: new RegExp(fullName[0], 'i') }
				query5[searchField] = { $regex: new RegExp(fullName[1], 'i') }
				query6.lastName = { $regex: new RegExp(fullName[1], 'i') }
				search = { $match: { $or: [query1, query2, query3, query4, query5, query6] } }
			}
		} else if (searchField === 'uniqueId') {
			const query = {}
			query[searchField] = { $eq: Number(searchValue) }
			search = { $match: query }
		} else {
			const query = {}
			query[searchField] = { $regex: new RegExp(searchValue, 'i') }
			search = { $match: query }
		}

		const users = await User.aggregate([userEmailPhoneValidation, condition, project, search, sort, count, project1])

		if (users.length === 0) return res.json({ success: true, responseData: [], count: 0 })

		return res.json({
			success: true,
			...utils.middleware(req.headers.lang, USER_MESSAGE_CODE.USER_LIST_SUCCESSFULLY, true),
			responseData: users[0].data,
			count: users[0].count
		})
	} catch (error) {
		console.log(error)
		utils.catchBlockErrors(req.headers.lang, error, res)
	}
}


exports.approveUser = async (req, res) => {
	try {
		await utils.checkRequestParams(req.body, [{ name: 'userId', type: 'string' }])
		const requestDataBody = req.body
		const findUser = await User.findById(requestDataBody.userId)
		if(!findUser) throw ({ errorCode: ERROR_CODE.DETAILS_NOT_FOUND })
		if(findUser.type === 1) throw ({ errorCode: ADMIN_ERROR_CODE.USER_DO_NOT_NEED_APPROVAL })
		if(findUser.isApproved === true) throw ({ errorCode: ADMIN_ERROR_CODE.USER_ALREADY_APPROVAD })
		const user = await User.findByIdAndUpdate({ _id: requestDataBody.userId }, { isApproved: true }, { new: true })
		if(!user) throw ({ errorCode: ERROR_CODE.SOMETHING_WENT_WRONG })
		return res.json({
			success: true,
			...utils.middleware(req.headers.lang, USER_MESSAGE_CODE.USER_APPROVED, true),
			responseData: user
		})
	} catch (error) {
		console.log(error)
		utils.catchBlockErrors(req.headers.lang, error, res)
	}
}

exports.getLastMonthAndLastWeekUserCount = async (req, res) => {
	try {
		console.log( new Date(new Date() - 7 * 60 * 60 * 24 * 1000));
		const lastWeekUserData = await User.find({ created_at: { $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000) } })
		console.log(lastWeekUserData);
		monthData = new Date()
		console.log(monthData);
		monthData.setMonth(monthData.getMonth() - 1)
		console.log(monthData);
		const lastMonthUserData = await User.find({ created_at: { $gte: monthData } })
		const Retailers = await User.find({ type: 1 }).count()
		const Wholesalers = await User.find({ type: 2 }).count()
		res.json({
			success: true,
			lastWeekUserDataCount: lastWeekUserData.length,
			lastMonthUserDataCount: lastMonthUserData.length,
			Retailers: Retailers,
			Wholesalers: Wholesalers
		})
	} catch (error) {
		utils.catchBlockErrors(req.headers.lang, error, res)
	}
}
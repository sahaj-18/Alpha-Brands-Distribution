require('../../utils/messageCode')
require('../../utils/errorCode')
require('../../utils/constant')
const cart = require('../../models/admin/cart')
const utils = require('../../utils/utils')
const User = require('mongoose').model('user')
const Cart = require('mongoose').model('cart')
const OrderHistory = require('mongoose').model('orderHistory')

exports.addToOrderHistory = async (req,res) => {
    try {
        const requestDataBody = req.body
        await utils.checkRequestParams(req.body, [{ name: 'userId', type: 'string' }])
        const cartDeatils = await Cart.find({userId:requestDataBody.userId})
        if(cartDeatils.length === 0) throw ({ errorCode: ERROR_CODE.DETAILS_NOT_FOUND })
        let cartItemArray = cartDeatils[0].items
        let total = 0;
        cartItemArray.map((item) => {
            total += (Number(item.price) * Number(item.quantity))
        })
        const findUser = await User.findById(requestDataBody.userId)
        if(!findUser) throw ({ errorCode: USER_ERROR_CODE.USER_DATA_NOT_FOUND })
        const newOrderDetail = new OrderHistory({
            firstName: findUser.firstName,
            lastName: findUser.lastName,
            email: findUser.email,
            phone: findUser.phone,
            profile: findUser.profile,
            items: cartDeatils[0].items,
            total: total
        })
        const addHistory = await newOrderDetail.save()
        if (!addHistory) throw ({ errorCode: ORDER_HISTORY_ERROR_CODE.ORDER_HISTORY_NOT_SAVED })
        let cartId = findUser.cartId
        findUser.cartId = null
        const userUpate = await findUser.save()
        if(!userUpate) throw ({ errorCode: USER_ERROR_CODE.UPDATE_FAILED })
        let deleteCart = await Cart.findByIdAndRemove(cartId)
        res.json({success: true,responseData : cartDeatils[0],total: total})

    } catch (error) {
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
}

exports.getOrderHistorySearchSort = async(req,res) => {
    try {
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
            const orderHistory = await OrderHistory.aggregate([
                sort,
                count,
                project1
            ])

            if (orderHistory.length === 0) throw { errorCode: ERROR_CODE.DETAILS_NOT_FOUND }

            return res.json({
                success: true,
                ...utils.middleware(req.headers.lang, ORDER_HISTORY_MESSAGE_CODE.ORDER_HISTORY_LIST_SUCCESSFULLY, true),
                responseData: orderHistory[0].data,
                count: orderHistory[0].count
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
        const orderHistory = await OrderHistory.aggregate([search, sort, count, project1])
        if (orderHistory.length === 0) throw ({ errorCode: ERROR_CODE.DETAILS_NOT_FOUND })
        return res.json({
            success: true,
            ...utils.middleware(req.headers.lang,ORDER_HISTORY_MESSAGE_CODE.ORDER_HISTORY_LIST_SUCCESSFULLY, true),
            responseData: orderHistory[0].data,
            count: orderHistory[0].count
        })

    } catch (error) {
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
}
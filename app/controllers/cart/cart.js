require('../../utils/messageCode')
require('../../utils/errorCode')
require('../../utils/constant')
const cart = require('../../models/admin/cart')
const utils = require('../../utils/utils')
const Cart = require('mongoose').model('cart')
const User = require('mongoose').model('user')
const Product = require('mongoose').model('product')

exports.addToCart = async (req,res) => {
    try {
        const requestDataBody = req.body
        let checkBool = 0;
        await utils.checkRequestParams(req.body, [{ name: 'userId', type: 'string' },{ name: 'productId', type: 'string' }])
        const user = await User.findById(requestDataBody.userId)
        if(!user) throw ({ errorCode: ERROR_CODE.DETAILS_NOT_FOUND })
        const cartItems = await Cart.find({userId: requestDataBody.userId})
        let boolArr = []
        if((cartItems.length !== 0)){
            (cartItems[0].items).map((item) => {
                if(item._id.equals(requestDataBody.productId)){
                    boolArr.push(true)
                }
            })
        }
        // let itemsInCartArray = cartItems[0].items
        if(cartItems.length === 0) {
            checkBool = 1;
            const product = await Product.findById(requestDataBody.productId) 
            if(!product) throw ({ errorCode: ERROR_CODE.DETAILS_NOT_FOUND })
            let price = ''
            if(user.type === 1){
                price = product.priceForRetailer
            }if(user.type === 2){
                price = product.priceForwholesaler
            }
            let arr = []
            arr.push({
                _id:product._id,
                productImage:product.productImage,
                productTitle: product.productTitle,
                productDescription: product.productDescription,
                price: price,
                category:product.category,
                quantity:requestDataBody.quantity
            })
            const newCartItem = new Cart({
            userId: requestDataBody.userId,
            items: arr
            })

        const addItemInCart = await newCartItem.save()
        if(!addItemInCart) throw ({ errorCode: CART_ERROR_CODE.ITEM_NOT_ADDED })
        user.cartId = newCartItem._id
        await user.save()
        return res.json({ success: true, ...utils.middleware(req.headers.lang, CART_MESSAGE_CODE.ITEM_ADDED, true), responseData: addItemInCart })
        }else if(boolArr.includes(true)){
            checkBool = 2
            let finalArr = cartItems[0].items
            finalArr.map((item,indexs) => {
                if(item._id.equals(requestDataBody.productId)){
                    let obj = {
                        _id:item._id,
                        productImage:item.productImage,
                        productTitle: item.productTitle,
                        productDescription: item.productDescription,
                        price: item.price,
                        category:product.category,
                        quantity:requestDataBody.quantity
                    }
                    finalArr.splice(indexs,1)
                    finalArr.push(obj)
                }
            })
            const editInCart = await Cart.findByIdAndUpdate(cartItems[0]._id,{  items: finalArr  },{new: true}).exec()
            if(!editInCart) throw ({ errorCode: CART_ERROR_CODE.ITEM_NOT_ADDED })
            return res.json({ success: true, ...utils.middleware(req.headers.lang, CART_MESSAGE_CODE.ITEM_ADDED, true), responseData: editInCart })
        }
        else if(checkBool == 0 && checkBool !== 1 && checkBool !== 2){
            const product = await Product.findById(requestDataBody.productId) 
            if(!product) throw ({ errorCode: ERROR_CODE.DETAILS_NOT_FOUND })
            let obj = {}
            let price = ''
            if(user.type === 1){
                price = product.priceForRetailer
            }if(user.type === 2){
                price = product.priceForwholesaler
            }
            obj = {
                _id:product._id,
                productImage:product.productImage,
                productTitle: product.productTitle,
                productDescription: product.productDescription,
                price: price,
                category:product.category,
                quantity:requestDataBody.quantity
            }
            const editInCart = await Cart.findByIdAndUpdate(cartItems[0]._id,{ $push: { items: obj } },{new: true}).exec()
            if(!editInCart) throw ({ errorCode: CART_ERROR_CODE.ITEM_NOT_ADDED })
            return res.json({ success: true, ...utils.middleware(req.headers.lang, CART_MESSAGE_CODE.ITEM_ADDED, true), responseData: editInCart })
        }
    } catch (error) {
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
}

exports.editItemInCart = async (req,res) => {
    try {
        const requestDataBody = req.body
        await utils.checkRequestParams(req.body, [{ name: 'userId', type: 'string' },{ name: 'productId', type: 'string' }])
        const itemsInCart = await Cart.find({userId: requestDataBody.userId})
        if(itemsInCart.length === 0) throw ({ errorCode: ERROR_CODE.DETAILS_NOT_FOUND })
        let itemsInCartArray = itemsInCart[0].items
        let arr = []
        itemsInCartArray.map((item,index) => {
            if(item._id.equals(requestDataBody.productId)){
                let obj = {
                    _id:item._id,
                    productImage:item.productImage,
                    productTitle: item.productTitle,
                    productDescription: item.productDescription,
                    price: item.price,
                    quantity:requestDataBody.quantity
                }
                itemsInCartArray.splice(index,1)
                itemsInCartArray.push(obj)
            }
        })
        editcartItem = await Cart.findByIdAndUpdate(itemsInCart[0]._id,{items:itemsInCartArray},{new:true})
        if(!editcartItem) throw ({ errorCode: CART_ERROR_CODE.UPDATION_FAILED })
        return res.json({ success: true, ...utils.middleware(req.headers.lang, CART_MESSAGE_CODE.ITEM_EDIT_SUCCESFULLY, true), responseData: editcartItem })
    } catch (error) {
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
}

exports.deleteItemInCart = async (req,res) => {
    try{
        const requestDataBody = req.body
        await utils.checkRequestParams(req.body, [{ name: 'userId', type: 'string' },{ name: 'productId', type: 'string' }])
        const cartItems = await cart.find({userId:requestDataBody.userId})
        if(cartItems.length === 0) throw ({ errorCode: ERROR_CODE.DETAILS_NOT_FOUND })
        let itemsInCartArray = cartItems[0].items
        let arr = []
        itemsInCartArray.map((item) => {
            
            if(!(item._id.equals(requestDataBody.productId))){
                arr.push(item)
            }
        })
        editcartItem = await Cart.findByIdAndUpdate(cartItems[0]._id,{items:arr},{new:true})
        if(!editcartItem) throw ({ errorCode: CART_ERROR_CODE.UPDATION_FAILED })
        return res.json({ success: true, ...utils.middleware(req.headers.lang, CART_MESSAGE_CODE.PRODUCT_DELETED_SUCCESSFULLY, true) })
    } catch (error) { 
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
}

exports.clearWholeCart = async (req,res) => {
    try {
        const requestDataBody = req.body
        await utils.checkRequestParams(req.body, [{ name: 'userId', type: 'string' }])
        const clearAllCart = await Cart.deleteMany({userId: requestDataBody.userId})
        if (clearAllCart.deletedCount !== 1) throw ({ errorCode: ERROR_CODE.DETAILS_NOT_FOUND })
        return res.json({ success: true, ...utils.middleware(req.headers.lang, CART_MESSAGE_CODE.CART_CLEARED_SUCCESSFULLY, true) })
    } catch (error) { 
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
}

exports.getCartDetails = async (req,res) => {
    try{
        const requestDataBody = req.body
        await utils.checkRequestParams(req.body, [{ name: 'userId', type: 'string' }])
        const cartDeatils = await Cart.find({userId : requestDataBody.userId})
        if(cartDeatils.length === 0) throw ({ errorCode: ERROR_CODE.DETAILS_NOT_FOUND })

        const countryQuery = {
			$lookup: {
				from: 'users',
				localField: 'userId',
				foreignField: '_id',
				as: 'userDetails'
			}
		}
        const userDetails = await Cart.aggregate([countryQuery])
        let arr = []
        userDetails.map((item) => {
            if(item.userId.equals(requestDataBody.userId)){
                arr.push(item)
            }
        })
        let total = 0;
        (arr[0].items).map((item) => {
            total += (Number(item.price) * Number(item.quantity))
        })
        res.json({success: true,responseData : arr,total:total})
    } catch (error) { 
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
}

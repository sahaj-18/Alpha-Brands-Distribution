require('../../utils/messageCode')
require('../../utils/errorCode')
require('../../utils/constant')
const utils = require('../../utils/utils')
const Product = require('mongoose').model('product')

exports.addProduct = async (req,res) => {
    try {
        await utils.checkRequestParams(req.body, [{ name: 'productTitle', type: 'string' },{ name: 'productDescription', type: 'string' }, { name: 'priceForRetailer', type: 'string' }, { name: 'priceForwholesaler', type: 'string' },{ name: 'category', type: 'string' }])
        const requestDataBody = req.body
        const newProduct = new Product({
            productTitle: requestDataBody.productTitle.trim().toLowerCase(),
            productDescription: requestDataBody.productDescription.trim().toLowerCase(),
            priceForRetailer: requestDataBody.priceForRetailer,
            priceForwholesaler: requestDataBody.priceForwholesaler,
            category: requestDataBody.category
        })
        const imageFile = req.files
        if (imageFile !== undefined && imageFile.length > 0) {
            const imageName = newProduct._id + utils.generateServerToken(4)
            const url = utils.getStoreImageFolderPath(FOLDER_NAME.PRODUCT_IMAGES) + imageName + FILE_EXTENSION.PRODUCT
            newProduct.productImage = url
            utils.storeImageToFolder(imageFile[0].path, imageName + FILE_EXTENSION.PRODUCT, FOLDER_NAME.PRODUCT_IMAGES)
        }
        const addProduct = await newProduct.save()
        if (!addProduct) throw ({ errorCode: PRODUCT_ERROR_CODE.PRODUCT_NOT_SAVED })
        return res.json({ success: true, ...utils.middleware(req.headers.lang, PRODUCT_MESSAGE_CODE.PRODUCT_ADDED, true), responseData: addProduct })
    } catch (error) {
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
}


exports.editProduct = async (req,res) => {
    try{
        await utils.checkRequestParams(req.body, [{ name: 'productId', type: 'string' }])
        const requestDataBody = req.body
        const product = await Product.findById(requestDataBody.productId)
        if(!product) throw ({ errorCode: ERROR_CODE.DETAILS_NOT_FOUND })
        const imageFile = req.files
        if (imageFile !== undefined && imageFile.length > 0) {
			utils.deleteImageFromFolder(product.productImage, FOLDER_NAME.PRODUCT_IMAGES)
			const imageName = product._id + utils.generateServerToken(4)
			const url = utils.getStoreImageFolderPath(FOLDER_NAME.PRODUCT_IMAGES) + imageName + FILE_EXTENSION.PRODUCT
			requestDataBody.productImage = url
			utils.storeImageToFolder(imageFile[0].path, imageName + FILE_EXTENSION.PRODUCT, FOLDER_NAME.PRODUCT_IMAGES)
		}
        const updateProduct = await Product.findByIdAndUpdate(requestDataBody.productId,requestDataBody,{new:true})
        if(!updateProduct) throw ({ errorCode: PRODUCT_ERROR_CODE.PRODUCT_UPDATION_FAILED })
        return res.json({ success: true, ...utils.middleware(req.headers.lang, PRODUCT_MESSAGE_CODE.PRODUCT_UPDATED, true), responseData: updateProduct })
    } catch (error) {
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
}


exports.getDetailOfProduct = async (req,res) => {
    try {
        await utils.checkRequestParams(req.body, [{ name: 'productId', type: 'string' }])
        const product = await Product.findById(req.body.productId)
		if (!product) throw ({ errorCode: ERROR_CODE.DETAILS_NOT_FOUND })
        return res.json({ success: true, ...utils.middleware(req.headers.lang, PRODUCT_MESSAGE_CODE.PRODUCT_LIST_SUCCESSFULLY, true),responseData: product})
    } catch (error) {
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
}


exports.productSearchSortList = async (req,res) => {
    try {
        const requestDataBody = req.body
        const numberOfRecord = Number(requestDataBody.numberOfRecord) || 10000
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
            const products = await Product.aggregate([
                sort,
                count,
                project1
            ])

            if (products.length === 0) throw { errorCode: ERROR_CODE.DETAILS_NOT_FOUND }

            return res.json({
                success: true,
                ...utils.middleware(req.headers.lang, PRODUCT_MESSAGE_CODE.PRODUCT_LIST_SUCCESSFULLY, true),
                responseData: products[0].data,
                count: products[0].count
            })
        }
        console.log(requestDataBody);
        searchValue = searchValue.replace(/^\s+|\s+$/g, '')
		searchValue = searchValue.replace(/ +(?= )/g, '')

        category = requestDataBody.category
        // category = []
        let search
		if (searchField === 'uniqueId') {
            if(category.length > 0 && searchValue !== ''){
                const query = {}
                const query2 = {}
			    query[searchField] = { $eq: Number(searchValue) }
                query2.category =  {$in : category }
                console.log(query2);
			    search = { $match:  { $and: [query, query2] } }
            }else if(category.length === 0 && searchValue !== ''){
                const query = {}
			    query[searchField] = { $eq: Number(searchValue) }
			    search = { $match: query }
            }
            else if(category.length !== 0 && searchValue === ''){
                const query2 = {}
                query2.category =  {$in : category }
                console.log(query2);
			    search = { $match: query2}
            }
			
		}else if(searchField !== 'uniqueId'){
             if(category.length > 0 && searchValue !== ''){
                const query = {}
                const query2 = {}
			    query[searchField] = {  $regex: new RegExp(searchValue, 'i') }
                query2.category =  {$in : category }
                console.log(query2);
			    search = { $match:  { $and: [query, query2] } }
             } else if(category.length === 0 && searchValue !== ''){
                console.log('aaa');
                const query = {}
			    query[searchField] = {  $regex: new RegExp(searchValue, 'i') }
			    search = { $match: query }
            }else if(category.length !== 0 && searchValue === ''){
                const query2 = {}
                query2.category =  {$in : category }
                console.log(query2);
			    search = { $match: query2}
            }else if(category.length === 0 && searchValue === ''){
                const query2 = {}
                query2[searchField] =  {$ne : {$regex: new RegExp(searchValue, 'i')} }
                console.log(query2);
			    search = { $match: query2}
            }    
        }
        else {
		const query = {}
        query[searchField] = { $regex: new RegExp(searchValue, 'i') }
        search = { $match: query }
		}
        const products = await Product.aggregate([search, sort, count, project1])
        if (products.length === 0) throw ({ errorCode: ERROR_CODE.DETAILS_NOT_FOUND })
        return res.json({
            success: true,
            ...utils.middleware(req.headers.lang, PRODUCT_MESSAGE_CODE.PRODUCT_LIST_SUCCESSFULLY, true),
            responseData: products[0].data,
            count: products[0].count
        })
    } catch (error) {
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
}

exports.deleteProduct = async (req,res) => {
    try{
        await utils.checkRequestParams(req.body, [{ name: 'productId', type: 'string' }])
        const product = await Product.remove({ _id: req.body.productId })
        if (product.deletedCount !== 1) throw ({ errorCode: ERROR_CODE.DETAILS_NOT_FOUND })
        return res.json({ success: true, ...utils.middleware(req.headers.lang, PRODUCT_MESSAGE_CODE.PRODUCT_DELETED_SUCCESSFULLY, true) })
    } catch (error) {
        utils.catchBlockErrors(req.headers.lang, error, res)
    }
}
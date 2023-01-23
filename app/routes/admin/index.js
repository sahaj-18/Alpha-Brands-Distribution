const express = require('express')
const router = express.Router()

const admin = require('../../controllers/admin/admin')
const product = require('../../controllers/product/product')
const settings = require('../../controllers/admin/settings')
const cart = require('../../controllers/cart/cart')

router.post('/api/admin/addAdmin', admin.addAdmin)
router.post('/api/admin/getAdminDetail', admin.getAdminDetail)
router.post('/api/admin/adminLogin', admin.adminLogin)
router.post('/api/admin/adminLogout', admin.adminLogout)
router.post('/api/admin/adminList',admin.adminList)
router.post('/api/admin/updateAdmin',admin.updateAdmin)
router.post('/api/admin/deleteAdmin',admin.deleteAdmin)
router.post('/api/admin/userListSearchSort',admin.userListSearchSort)


router.post('/api/admin/approveUser',admin.approveUser)


router.post('/api/admin/addProduct',product.addProduct)
router.post('/api/admin/editProduct',product.editProduct)
router.post('/api/admin/getDetailOfProduct',product.getDetailOfProduct)
router.post('/api/admin/productSearchSortList',product.productSearchSortList)
router.post('/api/admin/deleteProduct',product.deleteProduct)


router.post('/api/admin/getSettingDetails',settings.getSettingDetails)
router.post('/api/admin/editSettingDetails',settings.editSettingDetails)


router.post('/api/admin/addToCart',cart.addToCart)
router.post('/api/admin/editItemInCart',cart.editItemInCart)
router.post('/api/admin/deleteItemInCart',cart.deleteItemInCart)
router.post('/api/admin/clearWholeCart',cart.clearWholeCart)
router.post('/api/admin/getCartDetails',cart.getCartDetails)

router.post('/api/admin/getLastMonthAndLastWeekUserCount',admin.getLastMonthAndLastWeekUserCount)



module.exports = router
module.exports = ERROR_CODE = {
	SOMETHING_WENT_WRONG: 101,
	DETAILS_NOT_FOUND: 102,
	TYPE_NOT_FOUND: 103
}

module.exports = ADMIN_ERROR_CODE = {
    EMAIL_ALREADY_REGISTERED:201,
	ADMIN_NOT_SAVED: 202,
    INVALID_PASSWORD: 203,
    INVALID_AUTH_TOKEN: 204,
	USER_DO_NOT_NEED_APPROVAL:205,
	USER_ALREADY_APPROVAD:206,
	ANOTHER_ACTIVE_SESSSION: 207
}


module.exports = USER_ERROR_CODE = {
    PHONE_ALREADY_REGISTERED: 301,
	PASSWORD_MUST_BE_SIX_CHARACTER_LONG: 302,
	USER_NOT_SAVED: 303,
	USER_DATA_NOT_FOUND: 304,
	INVALID_PASSWORD: 305,
	UPDATE_FAILED: 306,
	INVALID_OTP: 307,
	PASSWORD_NOT_SAVED: 308,
	PAYMENT_FAILED: 309
}

module.exports = PRODUCT_ERROR_CODE = {
	PRODUCT_NOT_SAVED: 601,
	PRODUCT_UPDATION_FAILED: 602,
	YOU_ARE_NOT_APPROVED_BY_ADMIN: 603
}

module.exports = SETTING_ERROR_CODE = {
	SETTING_UPDATION_FAILED: 701
}

module.exports = CART_ERROR_CODE = {
	ITEM_NOT_ADDED: 801,
	UPDATION_FAILED: 802
}
module.exports = ORDER_HISTORY_ERROR_CODE = {
	ORDER_HISTORY_NOT_SAVED: 901
}

module.exports = CARD_ERROR_CODE = {
	CARD_NOT_SAVED: 1001,
	CARD_DATA_NOT_FOUND: 1002	
}
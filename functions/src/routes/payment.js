const express = require('express')
const {
  createCheckoutSession,
  attachPaymentMethod,
  getPaymentMethodByUser,
  deletePaymentMethodByUser,
  updateDefaultPaymentMethod,
  createSubscriptionByCustomer,
  createUsageRecord
} = require('../controllers/payment')
const router = express.Router()

router.route('/create-checkout-session').post(createCheckoutSession)
router.route('/update-default-payment-method').post(updateDefaultPaymentMethod)
router.route('/attach-payment-method').post(attachPaymentMethod)
router.route('/get-payment-method').post(getPaymentMethodByUser)
router.route('/delete-payment-method').post(deletePaymentMethodByUser)
router.route('/create-subscription').post(createSubscriptionByCustomer)
router.route('/create-usage-record').post(createUsageRecord)

module.exports = router

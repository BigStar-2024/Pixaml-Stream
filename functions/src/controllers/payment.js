const asyncHandler = require('../middlewares/asyncHandler')
// This is your test secret API key.
const stripe = require('stripe')(
  'sk_test_51OKm9iEsTrfxLzhVgtvvVxgygvlHD4vJ08aa02mKblDMYG3POOYB0jP0685QIsN2vHpItm0rF3JofLSqZtClb7Xi00FozNYojn'
)

const YOUR_DOMAIN = 'https://pixal-stream-dev.web.app/billing'

const productID = 'price_1OMKJEEsTrfxLzhV6GHKJRwv'

exports.createCheckoutSession = asyncHandler(async (req, res) => {
  const redirectURL = req.body
  console.log(redirectURL)

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        // price: price.id,
        // quantity: 1
        price_data: {
          currency: 'usd',
          unit_amount: 100000,
          product_data: { name: 'Billing' }
        },
        quantity: 1
      }
    ],
    mode: 'payment',
    // recurring_price: 'subscription',
    success_url: `${YOUR_DOMAIN}?success=true`,
    cancel_url: `${YOUR_DOMAIN}?canceled=true`
  })

  res.redirect(303, session.url)
})

exports.attachPaymentMethod = asyncHandler(async (req, res) => {
  const { paymentMethodId, customerId } = req.body
  try {
    // Attach the payment method to the customer
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId
    })
    // Set the payment method as the default for the customer
    const result = await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethod.id
      }
    })
    res.json({ success: true, result: result })
  } catch (error) {
    res.json({ success: false })
  }
})

exports.updateDefaultPaymentMethod = asyncHandler(async (req, res) => {
  const { customerID, paymentMethodID } = req.body
  console.log('payment Id', paymentMethodID)
  try {
    // Set the payment method as the default for the customer
    await stripe.customers.update(customerID, {
      invoice_settings: {
        default_payment_method: paymentMethodID
      }
    })
    res.json({ success: true })
  } catch (error) {
    res.json({ success: false })
  }
})

exports.getPaymentMethodByUser = asyncHandler(async (req, res) => {
  const { cards, customerID } = req.body
  let all_paymentMethods = []
  try {
    const customerInfo = await stripe.customers.retrieve(customerID)

    for (let i = 0; i < cards?.length; i++) {
      const paymentMethod = await stripe.paymentMethods.retrieve(cards[i])
      all_paymentMethods.push(paymentMethod)
    }

    res.json({ customerInfo, cards: all_paymentMethods })
  } catch (error) {
    res.json({ success: false })
  }
})

exports.deletePaymentMethodByUser = asyncHandler(async (req, res) => {
  const paymentMethodId = req.body.paymentMethodId

  try {
    // Detach the payment method from the customer
    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId)

    res.status(200).json({ success: true, result: paymentMethod })
  } catch (error) {
    res.status(404).json({ success: false })
  }
})

exports.createSubscriptionByCustomer = asyncHandler(async (req, res) => {
  const { customerID } = req.body

  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerID,
      items: [
        {
          price: productID
        }
      ]
    })

    res.status(200).json({ success: true, result: subscription })
  } catch (error) {
    res.status(404).json({ success: false })
  }
})

exports.createUsageRecord = asyncHandler(async (req, res) => {
  const { subscriptionItemID, quantity } = req.body

  const timestamp = Math.floor(Date.now() / 1000)

  try {
    const usageRecord = await stripe.subscriptionItems.createUsageRecord(subscriptionItemID, {
      quantity: quantity,
      timestamp: timestamp
    })

    res.status(200).json({ success: true, result: usageRecord })
  } catch (error) {
    res.status(404).json({ success: false })
  }
})

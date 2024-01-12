const express = require('express')
const cors = require('cors')
const functions = require('firebase-functions')
const admin = require('firebase-admin')

// Import Routes
const payment = require('./src/routes/payment')

// Create express app
const app = express()

// Body parser
app.use(express.json())

// Cors
app.use(cors())

// Mount routes
app.get('/', async (req, res) => {
  res.send('Welcome Daniel, Brian, Welcome to Pixal Stream')
})

app.use('/payment', payment)

exports.app = functions.https.onRequest(app)

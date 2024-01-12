import React, { useState, useEffect } from 'react'
import { Grid, Button, Box, Typography } from '@mui/material'
import MainCard from '../../components/MainCard'
import { useLocation } from 'react-router-dom'

export default function Billing () {
  const location = useLocation()

  const [message, setMessage] = useState('')

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search)

    if (query.get('success')) {
      setMessage('Order placed! You will receive an email confirmation.')
    }

    if (query.get('canceled')) {
      setMessage("Order canceled -- continue to shop around and checkout when you're ready.")
    }
  }, [])

  return (
    <MainCard>
      {message ? (
        <Box>
          <Typography>{message}</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box>
              <Typography fontSize={20} fontWeight={'bold'}>
                EC2 Billing
              </Typography>
              <Typography>$1000.00</Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <form action='https://us-central1-pixal-stream-dev.cloudfunctions.net/app/payment/create-checkout-session' method='POST'>
              <Button variant='contained' type='submit'>
                Checkout
              </Button>
            </form>
          </Grid>
        </Grid>
      )}
    </MainCard>
  )
}

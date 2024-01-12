import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Grid,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Divider,
  Card,
  CardContent,
  CardMedia,
  Icon,
  DialogActions
} from '@mui/material'
import { Form, FormGroup } from 'reactstrap'
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded'
import axios from 'axios'

import { CardNumberElement, CardExpiryElement, CardCvcElement, ElementsConsumer, Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import {
  attachPaymentMethod,
  deletePaymentMethodByUser,
  getCustomerID,
  getPaymentMethodByUser,
  removePaymentMethodId
} from '../../store/actions/billingAction'
import { toast } from 'react-toastify'

const publishable_API = 'pk_test_51OKm9iEsTrfxLzhVhZB9nIkuAHJ7kDnkY8qaaXM8Nhd66MdIf43Q4EmSxzd10b1wx2fscqIWPvHLz0Io4UogOSI600S5Sw9YTg'

// const URL = 'https://us-central1-pixal-stream-dev.cloudfunctions.net/app'
const URL = 'http://127.0.0.1:5001/pixal-stream-dev/us-central1/app'

let stripePromise = loadStripe(publishable_API)

export default function PaymentMethod () {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { loading } = useSelector(state => state.loading)
  const { customer, cards, customerInfo } = useSelector(state => state.billing)
  const [paymentCardModal, setPaymentCardModal] = useState(false)
  const [deleteModalFlag, setDeleteModalFlag] = useState(false)

  const [selectedItem, setSelectedItem] = useState('')

  useEffect(() => {
    dispatch(getCustomerID(user.id))
  }, [])

  useEffect(() => {
    if (user.cards) {
      dispatch(getPaymentMethodByUser(customer?.stripeId, user.cards))
    }
  }, [user, customer])

  const handleCardInfo = async (e, elements, stripe) => {
    e.preventDefault()
    const cardElement = await elements.getElement(CardNumberElement)
    const cardElement2 = await elements.getElement(CardExpiryElement)
    const cardElement3 = await elements.getElement(CardCvcElement)

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      card: cardElement2,
      card: cardElement3
    })

    if (error) {
      toast.warn('Card Details not Added')
    } else {
      let body = {
        paymentMethod: paymentMethod.card,
        paymentMethodId: paymentMethod.id,
        customerId: customer.stripeId
      }
      if (user?.cards?.length > 10) {
        toast.warn('You can add only one credit card.')
      } else {
        dispatch(
          attachPaymentMethod(user.id, body, () => {
            setPaymentCardModal(false)
          })
        )
      }
    }
  }

  const handleUpdateDefaultCard = async id => {
    const body = {
      customerID: customer.stripeId,
      paymentMethodID: id
    }
    dispatch({
      type: 'LOADING_TRUE'
    })
    await axios
      .post(`${URL}/payment/update-default-payment-method`, body)
      .then(res => {
        let updatedInfo = { ...customerInfo }
        updatedInfo.invoice_settings.default_payment_method = id
        dispatch({
          type: 'UPDATE_CUSTOMER_INFO',
          payload: updatedInfo
        })
        dispatch({
          type: 'LOADING_FALSE'
        })
      })
      .catch(err => {
        dispatch({
          type: 'LOADING_FALSE'
        })

        toast.error(err.message)
      })
  }

  const handlePaymentMethodDelete = () => {
    dispatch(
      deletePaymentMethodByUser(selectedItem, () => {
        dispatch(removePaymentMethodId(user?.id, selectedItem))
      })
    )
  }

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography marginLeft={'10px'} textAlign={'left'} fontWeight={'bold'} fontSize={'20px'}>
            Payment Methods
          </Typography>
          <Typography margin={3} textAlign={'left'} fontWeight={'bold'} fontSize={'18px'}>
            {`My Cards (${cards ? cards?.length : 0})`}
          </Typography>
          {cards?.map((cardItem, index) => (
            <Box marginBottom={1} key={index}>
              <Card sx={{ boxShadow: 'none' }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                      <Box>
                        <Box display={'flex'} marginTop={'10px'}>
                          {/* <Box>
                            <CardMedia width={'150px'} component={'img'} image={CardImage[cardItem.card.brand]} alt='Visa Card' />
                          </Box> */}
                          <Box marginLeft={'10px'}>
                            <Box display={'flex'} alignItems={'center'}>
                              <Typography>{cardItem?.card?.brand + '****' + cardItem?.card?.last4}</Typography>
                              {customerInfo?.invoice_settings.default_payment_method === cardItem.id && (
                                <Typography
                                  sx={{
                                    padding: '2px',
                                    border: 'dashed',
                                    borderRadius: '5px',
                                    borderWidth: '1px',
                                    borderColor: '#0074D9',
                                    backgroundColor: '#0074D9'
                                  }}
                                  marginLeft={1}
                                  color={'white'}
                                  fontSize={10}
                                >
                                  Default
                                </Typography>
                              )}
                            </Box>
                            <Typography>Card expires at {cardItem?.card?.exp_month + '/' + cardItem?.card?.exp_year}</Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box display={'flex'} variant='contanided'>
                        <Button
                          sx={{
                            marginRight: 1,
                            color: 'white'
                          }}
                          onClick={() => {
                            handleUpdateDefaultCard(cardItem.id)
                          }}
                          disabled={customerInfo?.invoice_settings.default_payment_method === cardItem.id || loading}
                          variant='contained'
                        >
                          Set as default
                        </Button>
                        <Button
                          variant='contained'
                          color='error'
                          disabled={loading}
                          onClick={() => {
                            setDeleteModalFlag(true)
                            setSelectedItem(cardItem.id)
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          ))}
          <Typography
            marginTop={2}
            textAlign={'left'}
            sx={{
              padding: '20px',
              border: 'dashed',
              borderRadius: '10px',
              borderWidth: '1px',
              borderColor: '#0074D9',
              backgroundColor: '#cfebff'
            }}
          >
            <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
              <Box>
                <Typography fontWeight={'bold'} color={'black'} fontSize={18}>
                  Important Note!
                </Typography>
                <Typography color={'black'}>Add your Card for the payment purpose</Typography>
              </Box>
              <Button
                onClick={() => {
                  setPaymentCardModal(true)
                }}
                variant='contained'
              >
                Add Card
              </Button>
            </Box>
          </Typography>
        </Grid>
      </Grid>
      <Dialog
        open={paymentCardModal}
        onClose={() => setPaymentCardModal(false)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle
          id='alert-dialog-title'
          style={{
            fontSize: '25px',
            fontWeight: 'bold'
          }}
        >
          Add New Card
        </DialogTitle>
        <Divider />
        <DialogContent>
          <DialogContentText id='alert-dialog-description' style={{ textAlign: 'center' }}>
            <Box width={500}>
              <Elements stripe={stripePromise}>
                <ElementsConsumer>
                  {({ elements, stripe }) => (
                    <Form
                      onSubmit={e => {
                        handleCardInfo(e, elements, stripe)
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <FormGroup>
                            <CardNumberElement
                              required
                              options={{
                                placeholder: '1234 1234 1234 1234',
                                style: {
                                  base: {
                                    // backgroundColor: "#232733",
                                    fontSize: '16px'
                                  },
                                  invalid: {
                                    color: '#9e2146'
                                  }
                                }
                              }}
                            />
                          </FormGroup>
                        </Grid>
                        <Grid item xs={6}>
                          <FormGroup>
                            <CardExpiryElement
                              required
                              options={{
                                placeholder: 'MM/YY',
                                style: {
                                  base: {
                                    fontSize: '16px'
                                  },
                                  invalid: {
                                    color: '#9e2146'
                                  }
                                }
                              }}
                            />
                          </FormGroup>
                        </Grid>
                        <Grid item xs={6}>
                          <FormGroup>
                            <CardCvcElement
                              required
                              options={{
                                placeholder: 'CVC',
                                style: {
                                  base: {
                                    fontSize: '16px'
                                  },
                                  invalid: {
                                    color: '#9e2146'
                                  }
                                }
                              }}
                            />
                          </FormGroup>
                        </Grid>
                        <Grid item xs={12}>
                          <Button fullWidth disabled={loading} variant='contained' type='submit'>
                            Add
                          </Button>
                        </Grid>
                      </Grid>
                    </Form>
                  )}
                </ElementsConsumer>
              </Elements>
            </Box>
          </DialogContentText>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteModalFlag}
        onClose={() => setDeleteModalFlag(false)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle
          id='alert-dialog-title'
          style={{
            fontSize: '25px',
            fontWeight: 'bold'
          }}
        >
          {'Delete Card Info'}
        </DialogTitle>
        <Divider />
        <DialogContent>
          <DialogContentText id='alert-dialog-description' style={{ textAlign: 'center' }}>
            <Icon
              sx={{
                width: '100px',
                height: '100px',
                backgroundColor: '#FF9999',
                borderRadius: '50%'
              }}
            >
              <PriorityHighRoundedIcon
                sx={{
                  width: '100%',
                  height: '100%',
                  color: '#F60000'
                }}
              />
            </Icon>
            <Typography fontSize={'18px'}>Are you sure you want to delete this card information?</Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions
          style={{
            display: 'flex',
            justifyContent: 'space-around'
          }}
        >
          <Button
            variant='outlined'
            color='error'
            style={{ margin: '20px' }}
            fullWidth
            onClick={() => {
              setDeleteModalFlag(false)
            }}
          >
            Keep Card
          </Button>
          <Button
            fullWidth
            variant='contained'
            color='error'
            style={{ margin: '20px' }}
            onClick={() => {
              handlePaymentMethodDelete()
              setDeleteModalFlag(false)
            }}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

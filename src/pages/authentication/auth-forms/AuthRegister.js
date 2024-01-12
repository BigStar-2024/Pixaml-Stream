import { useEffect, useState } from 'react'
import { Navigate, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import firebase from '../../../config/firebase'

// material-ui
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  Link,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
  TextField
} from '@mui/material'

// third party
import * as Yup from 'yup'
import { Formik } from 'formik'

// project import
import FirebaseSocial from './FirebaseSocial'
import AnimateButton from '../../../components/@extended/AnimateButton'
import { strengthColor, strengthIndicator } from '../../../utils/password-strength'

// assets
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { sendEmailViaFirebase, signUpUser, verifyCodeCheck, verifySuccess } from '../../../store/actions/authActions'
import { toast } from 'react-toastify'

// ============================|| FIREBASE - REGISTER ||============================ //

function AuthRegister () {
  // Defined by smile
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { loading } = useSelector(state => state.loading)

  const [verifyStep, setVerifyStep] = useState(false)
  const [verifyCode, setVerifyCode] = useState('')
  const [currentCodeID, setCurrentCodeID] = useState('')
  const [userInfo, setUserInfo] = useState({})

  const handleRegister = credential => {
    const user = {
      fullName: credential.firstname + ' ' + credential.lastname,
      organization: credential.organization,
      email: credential.email,
      password: credential.password
    }
    setUserInfo(user)
    dispatch(
      sendEmailViaFirebase(credential.email, id => {
        setVerifyStep(true)
        toast.success('Sent the verification code')
        setCurrentCodeID(id)
      })
    )
  }

  const handleVerifyClick = () => {
    dispatch(
      verifyCodeCheck(verifyCode, currentCodeID, () => {
        toast.success('Verify Success!')
        dispatch(
          signUpUser(userInfo, () => {
            navigate('/login')
            toast.success('Sign Up Success!')
          })
        )
      })
    )
  }

  const handleResendClick = () => {}

  // Defined by template
  const [level, setLevel] = useState()
  const [showPassword, setShowPassword] = useState(false)
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const handleMouseDownPassword = event => {
    event.preventDefault()
  }

  const changePassword = value => {
    const temp = strengthIndicator(value)
    setLevel(strengthColor(temp))
  }

  useEffect(() => {
    changePassword('')
  }, [])

  return (
    <>
      <Formik
        initialValues={{
          firstname: '',
          lastname: '',
          organization: '',
          email: '',
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          firstname: Yup.string().max(255).required('First Name is required'),
          lastname: Yup.string().max(255).required('Last Name is required'),
          organization: Yup.string().max(255).required('Organization Name is required'),
          email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
          password: Yup.string().max(255).required('Password is required')
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            handleRegister(values)
            setStatus({ success: false })
            setSubmitting(false)
          } catch (err) {
            console.error(err)
            setStatus({ success: false })
            setErrors({ submit: err.message })
            setSubmitting(false)
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <Box>
            {verifyStep === false ? (
              <form noValidate onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor='firstname-signup'>First Name*</InputLabel>
                      <OutlinedInput
                        id='firstname-login'
                        type='firstname'
                        value={values.firstname}
                        name='firstname'
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder='John'
                        fullWidth
                        error={Boolean(touched.firstname && errors.firstname)}
                      />
                      {touched.firstname && errors.firstname && (
                        <FormHelperText error id='helper-text-firstname-signup'>
                          {errors.firstname}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor='lastname-signup'>Last Name*</InputLabel>
                      <OutlinedInput
                        fullWidth
                        error={Boolean(touched.lastname && errors.lastname)}
                        id='lastname-signup'
                        type='lastname'
                        value={values.lastname}
                        name='lastname'
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder='Doe'
                        inputProps={{}}
                      />
                      {touched.lastname && errors.lastname && (
                        <FormHelperText error id='helper-text-lastname-signup'>
                          {errors.lastname}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor='organization'>Organization*</InputLabel>
                      <OutlinedInput
                        fullWidth
                        error={Boolean(touched.organization && errors.organization)}
                        id='organization'
                        type='organization'
                        value={values.organization}
                        name='organization'
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder='Astra Tech, LLC'
                        inputProps={{}}
                      />
                      {touched.organization && errors.organization && (
                        <FormHelperText error id='helper-text-organization-signup'>
                          {errors.organization}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor='email-signup'>Email Address*</InputLabel>
                      <OutlinedInput
                        fullWidth
                        error={Boolean(touched.email && errors.email)}
                        id='email-login'
                        type='email'
                        value={values.email}
                        name='email'
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder='demo@company.com'
                        inputProps={{}}
                      />
                      {touched.email && errors.email && (
                        <FormHelperText error id='helper-text-email-signup'>
                          {errors.email}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor='password-signup'>Password</InputLabel>
                      <OutlinedInput
                        fullWidth
                        error={Boolean(touched.password && errors.password)}
                        id='password-signup'
                        type={showPassword ? 'text' : 'password'}
                        value={values.password}
                        name='password'
                        onBlur={handleBlur}
                        onChange={e => {
                          handleChange(e)
                          changePassword(e.target.value)
                        }}
                        endAdornment={
                          <InputAdornment position='end'>
                            <IconButton
                              aria-label='toggle password visibility'
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge='end'
                              size='large'
                            >
                              {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                            </IconButton>
                          </InputAdornment>
                        }
                        placeholder='******'
                        inputProps={{}}
                      />
                      {touched.password && errors.password && (
                        <FormHelperText error id='helper-text-password-signup'>
                          {errors.password}
                        </FormHelperText>
                      )}
                    </Stack>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <Grid container spacing={2} alignItems='center'>
                        <Grid item>
                          <Box sx={{ bgcolor: level?.color, width: 85, height: 8, borderRadius: '7px' }} />
                        </Grid>
                        <Grid item>
                          <Typography variant='subtitle1' fontSize='0.75rem'>
                            {level?.label}
                          </Typography>
                        </Grid>
                      </Grid>
                    </FormControl>
                  </Grid>
                  {errors.submit && (
                    <Grid item xs={12}>
                      <FormHelperText error>{errors.submit}</FormHelperText>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <AnimateButton>
                      <Button
                        disableElevation
                        disabled={isSubmitting || loading}
                        fullWidth
                        size='large'
                        type='submit'
                        variant='contained'
                        color='primary'
                      >
                        Create Account
                      </Button>
                    </AnimateButton>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider>
                      <Typography variant='caption'>Sign up with</Typography>
                    </Divider>
                  </Grid>
                  <Grid item xs={12}>
                    <FirebaseSocial eventType={'register'} />
                  </Grid>
                </Grid>
              </form>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField type='number' fullWidth value={verifyCode} onChange={e => setVerifyCode(e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <Button variant='contained' disabled={!verifyCode || loading} fullWidth onClick={handleVerifyClick}>
                    Verify
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button variant='outlined' disabled={loading} fullWidth onClick={handleResendClick}>
                    Resend the verification code
                  </Button>
                </Grid>
              </Grid>
            )}
          </Box>
        )}
      </Formik>
    </>
  )
}

export default AuthRegister

import React from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'

// material-ui
import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormHelperText,
  Grid,
  Link,
  IconButton,
  InputAdornment,
  InputLabel,
  Stack,
  Typography,
  OutlinedInput
} from '@mui/material'

// third party
import * as Yup from 'yup'
import { Formik } from 'formik'

// project import
import FirebaseSocial from './FirebaseSocial'
import AnimateButton from '../../../components/@extended/AnimateButton'

// assets
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { loginUserByInvite } from '../../../store/actions/authActions'

// ============================|| FIREBASE - LOGIN ||============================ //

const AuthLogin = () => {
  // Defined by smile
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { loading } = useSelector(state => state.loading)
  const { invitedInfo } = useSelector(state => state.auth)

  const handleLogin = credential => {
    const user = {
      email: invitedInfo?.email,
      password: credential.password,
      organizationID: invitedInfo?.organizationID
    }
    dispatch(
      loginUserByInvite(user, () => {
        navigate('/main-menu')
      })
    )
  }

  // Defined by template
  const [checked, setChecked] = React.useState(false)

  const [showPassword, setShowPassword] = React.useState(false)
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const handleMouseDownPassword = event => {
    event.preventDefault()
  }

  return (
    <>
      <Formik
        initialValues={{
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          password: Yup.string().max(255).required('Password is required')
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            handleLogin(values)
            setStatus({ success: false })
            setSubmitting(false)
          } catch (err) {
            setStatus({ success: false })
            setErrors({ submit: err.message })
            setSubmitting(false)
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor='email-login'>Email Address</InputLabel>
                  <OutlinedInput
                    id='email-login'
                    type='email'
                    value={invitedInfo?.email}
                    name='email'
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder='Enter email address'
                    fullWidth
                    disabled
                    error={Boolean(touched.email && errors.email)}
                  />
                  {touched.email && errors.email && (
                    <FormHelperText error id='standard-weight-helper-text-email-login'>
                      {errors.email}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor='password-login'>Password</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id='-password-login'
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name='password'
                    onBlur={handleBlur}
                    onChange={handleChange}
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
                    placeholder='Enter password'
                  />
                  {touched.password && errors.password && (
                    <FormHelperText error id='standard-weight-helper-text-password-login'>
                      {errors.password}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>

              <Grid item xs={12} sx={{ mt: -1 }}>
                <Stack direction='row' justifyContent='space-between' alignItems='center' spacing={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={event => setChecked(event.target.checked)}
                        name='checked'
                        color='primary'
                        size='small'
                      />
                    }
                    label={'Keep me sign in'}
                  />
                  <Link variant='h6' component={RouterLink} to='' color='text.primary'>
                    Forgot Password?
                  </Link>
                </Stack>
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
                    Login
                  </Button>
                </AnimateButton>
              </Grid>
              <Grid item xs={12}>
                <Divider>
                  <Typography variant='caption'> Login with</Typography>
                </Divider>
              </Grid>
              <Grid item xs={12}>
                <FirebaseSocial eventType={'login'} />
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  )
}

export default AuthLogin

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  FormControl,
  FormHelperText,
  useMediaQuery,
  InputLabel,
  MenuItem,
  Select,
  LinearProgress,
  Switch,
  OutlinedInput,
  InputAdornment,
  IconButton
} from '@mui/material'
import firebase from '../../config/firebase'
import MainCard from '../../components/MainCard'
import { useNavigate, useParams } from 'react-router'
import { useTheme } from '@mui/material/styles'
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons'
import { FileUploader } from 'react-drag-drop-files'

const fileTypes = ['JPEG', 'PNG', 'GIF']

export default function SavePublish () {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { loading } = useSelector(state => state.loading)
  const app_id = useParams().id
  const { org_id } = useParams()

  const theme = useTheme()
  const mobileScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const [distributionName, setDistributionName] = useState('')
  const [parameter, setParameter] = useState('')
  const [monthlyBudget, setMonthlyBudget] = useState('')
  const [protectFlag, setProtectFlag] = useState(false)
  const [password, setPassword] = useState('')
  const [limitUserCount, setLimitUserCount] = useState('')
  const [hotInstanceCount, setHotInstanceCount] = useState('')
  const [instanceType, setInstanceType] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [logoImage, setLogoImage] = useState(null)
  const [backgroundFile, setBackgroundFile] = useState(null)
  const [backgroundImage, setBackgroundImage] = useState(null)
  const [published, setPublished] = useState(false)

  const [showPassword, setShowPassword] = useState(false)

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const handleMouseDownPassword = event => {
    event.preventDefault()
  }

  const handleLogoFileChange = file => {
    logoHandleChange(file)
  }

  const handleBackgroundFileChange = file => {
    backgroundHandleChange(file)
  }

  const logoHandleChange = async file => {
    if (file.size > 3000000) {
      toast.error('Error: Image size is too big')
      return
    }
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png']

    if (!validFormats.includes(file.type)) {
      toast.error(`Error: Invalid file format. Please select a .jpg, .jpeg, or .png image.`, {
        style: {
          fontFamily: 'Poppins'
        }
      })
      return
    }
    setLogoImage(URL.createObjectURL(file))
    setLogoFile(file)
  }

  const backgroundHandleChange = async file => {
    if (file.size > 3000000) {
      toast.error('Error: Image size is too big')
      return
    }
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png']

    if (!validFormats.includes(file.type)) {
      toast.error(`Error: Invalid file format. Please select a .jpg, .jpeg, or .png image.`, {
        style: {
          fontFamily: 'Poppins'
        }
      })
      return
    }
    setBackgroundImage(URL.createObjectURL(file))
    setBackgroundFile(file)
  }

  const handleSaveApplication = async () => {
    dispatch({
      type: 'LOADING_TRUE'
    })

    const appInfo = {
      distributionName,
      limitUserCount,
      hotInstanceCount,
      monthlyBudget,
      protectFlag,
      instanceType,
      parameter
    }

    if (protectFlag) {
      appInfo.password = password
    }

    const storageRef = firebase.storage().ref()
    let logoURL = ''
    let backgroundURL = ''

    if (logoFile) {
      const logoRef = await storageRef.child('images/' + logoFile.name)
      const logoShot = await logoRef.put(logoFile)
      logoURL = await logoShot.ref.getDownloadURL()
    }

    if (backgroundFile) {
      const backgroundRef = await storageRef.child('images/' + backgroundFile.name)
      const backgroundShot = await backgroundRef.put(backgroundFile)
      backgroundURL = await backgroundShot.ref.getDownloadURL()
    }

    // Write to firestore
    const organizationRef = await firebase.firestore().collection('organizations').doc(org_id)
    const applicationRef = await organizationRef.collection('applications').doc(app_id)

    await applicationRef
      .collection('distributions')
      .add({
        ...appInfo,
        status: 'published',
        logoFile: logoURL,
        backgroundFile: backgroundURL,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(doc => {
        navigate(`/my-applications/${org_id}`)
        clear()
      })
      .catch(error => toast.error(error.message))

    setPublished(true)

    dispatch({
      type: 'LOADING_FALSE'
    })
  }

  const clear = () => {
    setDistributionName('')
    setParameter('')
    setLimitUserCount('')
    setHotInstanceCount('')
    setInstanceType('')
    setMonthlyBudget('')
    setLogoFile([])
    setBackgroundFile([])
    setLogoImage('')
    setBackgroundImage('')
  }

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {loading && <LinearProgress />}
        </Grid>
        <Grid item xs={12} display={'flex'} justifyContent={'space-between'}>
          <Typography fontWeight={'bold'} fontSize={'18px'}>
            Distribution
          </Typography>
          <Button variant='outlined' onClick={() => navigate(-1)}>
            Back
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Box paddingLeft={mobileScreen ? 0 : '100px'} paddingRight={mobileScreen ? 0 : '100px'}>
            <MainCard>
              {!published ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} lg={4}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <FormHelperText>Distribution Name*</FormHelperText>
                          <TextField value={distributionName} onChange={e => setDistributionName(e.target.value)} required />
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth>
                          <FormHelperText>Limit User Count*</FormHelperText>
                          <TextField type='number' value={limitUserCount} onChange={e => setLimitUserCount(e.target.value)} required />
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth>
                          <FormHelperText>Hot Instance Count*</FormHelperText>
                          <TextField type='number' value={hotInstanceCount} onChange={e => setHotInstanceCount(e.target.value)} />
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <FormHelperText>Monthly Budget in $*</FormHelperText>
                          <TextField type='number' value={monthlyBudget} onChange={e => setMonthlyBudget(e.target.value)} />
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6} display={'flex'} justifyContent={'space-around'} alignItems={'center'}>
                        <Typography>Password Protect</Typography>
                        <Switch checked={protectFlag} onChange={e => setProtectFlag(e.target.checked)} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <OutlinedInput
                            disabled={!protectFlag}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            type={showPassword ? 'text' : 'password'}
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
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <FormHelperText>Instance Type*</FormHelperText>
                          <Select
                            labelId='demo-simple-select-label'
                            id='demo-simple-select'
                            value={instanceType}
                            onChange={e => setInstanceType(e.target.value)}
                          >
                            <MenuItem value={'standard'}>Standard</MenuItem>
                            <MenuItem value={'fast'}>Fast</MenuItem>
                            <MenuItem value={'super'}>Super</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <FormHelperText>Parameters</FormHelperText>
                          <TextField value={parameter} onChange={e => setParameter(e.target.value)}></TextField>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <Button
                          disabled={!distributionName || !limitUserCount || !hotInstanceCount || !instanceType || !monthlyBudget || loading}
                          fullWidth
                          variant='contained'
                          onClick={() => {
                            handleSaveApplication()
                          }}
                        >
                          Save Publish
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} lg={8}>
                    <Grid container spacing={2} marginTop={5} display={'flex'} justifyContent={'space-around'} alignItems={'center'}>
                      <Grid item xs={12} md={8}>
                        <Typography marginBottom={1} align='center' fontWeight={'bold'} fontSize={20}>
                          Logo
                        </Typography>
                        <Box display={'flex'} justifyContent={'center'}>
                          <FileUploader handleChange={handleLogoFileChange} name='file' types={fileTypes} />
                        </Box>
                        <Typography align='center' marginTop={2} fontSize={15}>
                          {logoFile ? `File name: ${logoFile.name}` : 'no files uploaded yet'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4} display={'flex'} justifyContent={'center'}>
                        {logoImage && (
                          <img
                            src={logoImage}
                            alt='logo'
                            style={{
                              width: 200,
                              height: 200,
                              border: 'dashed',
                              borderRadius: 20,
                              borderWidth: 1,
                              borderColor: 'rgb(6, 88, 194)'
                            }}
                          />
                        )}
                      </Grid>
                      <Grid item xs={12} md={8}>
                        <Typography marginBottom={1} align='center' fontWeight={'bold'} fontSize={20}>
                          Background
                        </Typography>
                        <Box display={'flex'} justifyContent={'center'}>
                          <FileUploader handleChange={handleBackgroundFileChange} name='file' types={fileTypes} />
                        </Box>
                        <Typography align='center' marginTop={2} fontSize={15}>
                          {backgroundFile ? `File name: ${backgroundFile.name}` : 'no files uploaded yet'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4} display={'flex'} justifyContent={'center'}>
                        {backgroundImage && (
                          <img
                            src={backgroundImage}
                            alt='logo'
                            style={{
                              width: 200,
                              height: 200,
                              border: 'dashed',
                              borderRadius: 20,
                              borderWidth: 1,
                              borderColor: 'rgb(6, 88, 194)'
                            }}
                          />
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              ) : (
                <Box display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'}>
                  <TextField sx={{ width: 400, maxWidth: 400 }}>Share Link URL (Auto Gen)</TextField>
                  <Button variant='contained' sx={{ width: 400, maxWidth: 400, marginTop: 2 }}>
                    Copy Link Button
                  </Button>
                  <Link to={`/my-applications/${org_id}`}>
                    <Button variant='outlined' sx={{ marginTop: 9, width: 400, maxWidth: 400 }}>
                      Done Button
                    </Button>
                  </Link>
                </Box>
              )}
            </MainCard>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

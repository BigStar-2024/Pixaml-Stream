import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
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
  Paper,
  LinearProgress,
  Alert,
  AlertTitle
} from '@mui/material'
import firebase from '../../config/firebase'
import MainCard from '../../components/MainCard'
import { useNavigate, useParams } from 'react-router'
import { useTheme } from '@mui/material/styles'
import JSZip from 'jszip'
import { FileUploader } from 'react-drag-drop-files'
import { getCurrentApplication } from '../../store/actions/applicationActions'

const fileTypes = ['ZIP']

export default function EditApplication () {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { loading } = useSelector(state => state.loading)

  const { currentAPP } = useSelector(state => state.application)
  const app_id = useParams().id
  const { org_id } = useParams()

  const theme = useTheme()
  const mobileScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const [appName, setAppName] = useState('')
  const [appExeName, setAppExeName] = useState('')
  const [versionNum, setVersionNum] = useState(0)
  const [buildNum, setBuildNum] = useState(0)
  const [zipFile, setZipFile] = useState(null)
  const [zipList, setZipList] = useState(null)
  const [zipFilename, setZipFilename] = useState('')

  const [progress, setProgress] = useState(0)

  useEffect(() => {
    dispatch(getCurrentApplication(org_id, app_id))
  }, [app_id])

  useEffect(() => {
    setAppName(currentAPP?.appName || '')
    setZipList(currentAPP?.appList || [])
    setVersionNum(currentAPP?.versionNum || 0)
    setBuildNum(currentAPP?.buildNum || 0)
    setAppExeName(currentAPP?.appExeName || '')
    setZipFilename(currentAPP?.zipFilename || '')
  }, [currentAPP])

  const handleFileChange = file => {
    zipHandleChange(file)
  }

  const zipHandleChange = async file => {
    if (!file) {
      return
    }
    // List the inside file of zip file.
    let list = []
    setZipFile(file)
    setZipFilename(file.name)

    const zip = new JSZip()
    const extractedFiles = await zip.loadAsync(file)
    extractedFiles.forEach(async (relativePath, item) => {
      list.push(relativePath)
    })
    setZipList(list)
  }

  const handleCreateApplication = async () => {
    if (zipFile?.length === 0) {
      toast.error('You should select the zip file for application')
      return
    }

    dispatch({
      type: 'LOADING_TRUE'
    })
    console.log(zipFile)
    if (zipFile) {
      // Removing previous zip file
      await firebase
        .storage()
        .refFromURL(currentAPP.zipFile)
        .delete()
        .then(() => {})
        .catch(error => toast.error('Previous zip file is not exsit'))

      const storageRef = firebase.storage().ref()
      const file = storageRef.child('zip_files/' + zipFile.name)
      const uploadTask = file.put(zipFile)

      uploadTask.on(
        'state changed',
        snapshot => {
          // Update progress bar
          const go = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setProgress(go)
        },
        error => {
          toast.error(error.message)
        },
        async () => {
          // Upload complete, get download URL
          const downloadURL = await uploadTask.snapshot.ref.getDownloadURL()

          // Continue with your code
          const organizationRef = await firebase.firestore().collection('organizations').doc(org_id)

          await organizationRef
            .collection('applications')
            .doc(app_id)
            .update({
              appName,
              appExeName,
              appList: zipList,
              zipFile: downloadURL,
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
              navigate(`/my-applications/${org_id}`)
              toast.success('Updated the application')
            })
            .catch(error => toast.error(error.message))
        }
      )
    } else {
      const organizationRef = await firebase.firestore().collection('organizations').doc(org_id)

      await organizationRef
        .collection('applications')
        .doc(app_id)
        .update({
          appName,
          appExeName,
          versionNum,
          buildNum,
          appList: zipList,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
          navigate(`/my-applications/${org_id}`)
          toast.success('Updated the application')
        })
        .catch(error => toast.error(error.message))
    }

    dispatch({
      type: 'LOADING_FALSE'
    })
  }

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {progress !== 0 && <LinearProgress variant='determinate' value={progress} />}
        </Grid>
        <Grid item xs={12} display={'flex'} justifyContent={'space-between'}>
          <Typography fontWeight={'bold'} fontSize={'18px'}>
            Edit Application
          </Typography>
          <Button variant='outlined' onClick={() => navigate(-1)}>
            Back
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Box paddingLeft={mobileScreen ? 0 : '100px'} paddingRight={mobileScreen ? 0 : '100px'}>
            {loading && (
              <Alert severity='info' sx={{ marginBottom: 2 }}>
                <AlertTitle>Information</AlertTitle>
                Removing and Updating the previous zip file — <strong>Waiting for...</strong>
              </Alert>
            )}
            <MainCard>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <FormHelperText>Name</FormHelperText>
                        <TextField value={appName} onChange={e => setAppName(e.target.value)}></TextField>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id='demo-simple-select-label'>Select EXE file</InputLabel>
                        <Select
                          labelId='demo-simple-select-label'
                          id='demo-simple-select'
                          label='Select EXE'
                          value={appExeName}
                          onChange={e => setAppExeName(e.target.value)}
                        >
                          {zipList?.map((listItem, index) => (
                            <MenuItem key={index} value={listItem}>
                              {listItem}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <FormHelperText>Version Number</FormHelperText>
                        <TextField value={versionNum} onChange={e => setVersionNum(e.target.value)} />
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <FormHelperText>Build Number</FormHelperText>
                        <TextField value={buildNum} onChange={e => setBuildNum(e.target.value)} />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        disabled={loading || !appName || !appExeName}
                        fullWidth
                        variant='contained'
                        onClick={() => {
                          handleCreateApplication()
                        }}
                      >
                        Update
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={6} marginTop={3}>
                  <Box display={'flex'} justifyContent={'center'} alignItems={'center'} flexDirection={'column'}>
                    <FileUploader handleChange={handleFileChange} name='file' types={fileTypes} />
                    <Typography marginTop={2} fontWeight={'bold'} fontSize={15}>
                      {zipFilename ? `File name: ${zipFilename}` : 'no files uploaded yet'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </MainCard>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

import React, { useState } from 'react'
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
  Alert,
  AlertTitle,
  LinearProgress
} from '@mui/material'
import firebase from '../../config/firebase'
import MainCard from '../../components/MainCard'
import { useNavigate, useParams } from 'react-router'
import { useTheme } from '@mui/material/styles'
import JSZip from 'jszip'
import { newInstance } from '../../store/actions/applicationActions'
import { FileUploader } from 'react-drag-drop-files'
import { addNotification } from '../../store/actions/notificationAction'

const fileTypes = ['ZIP']

export default function CreateApplication () {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { loading } = useSelector(state => state.loading)

  const { org_id } = useParams()

  const theme = useTheme()
  const mobileScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const [appName, setAppName] = useState('')
  const [appExeName, setAppExeName] = useState('')
  const [versionNum, setVersionNum] = useState(0)
  const [buildNum, setBuildNum] = useState(0)
  const [zipFile, setZipFile] = useState(null)
  const [zipList, setZipList] = useState([])

  const [progress, setProgress] = useState(0)

  const handleFileChange = file => {
    zipHandleChange(file)
  }

  const zipHandleChange = async file => {
    if (!file) {
      return
    }
    let list = []
    setZipFile(file)

    const zip = new JSZip()
    const extractedFiles = await zip.loadAsync(file)
    extractedFiles.forEach(async (relativePath, item) => {
      list.push(relativePath)
    })
    setZipList(list)
  }

  const handleCreateApplication = async () => {
    if (zipFile.length === 0) {
      toast.error('You should select the zip file for application')
      return
    }

    dispatch({
      type: 'LOADING_TRUE'
    })

    const storageRef = firebase.storage().ref()
    const file = storageRef.child(`zip_files/${org_id}/${user.id}/` + zipFile.name)
    const uploadTask = file.put(zipFile)

    uploadTask.on(
      'state changed',
      snapshot => {
        // Update progress bar
        dispatch({
          type: 'LOADING_TRUE'
        })
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
          .add({
            userID: user.id,
            appName,
            appExeName,
            versionNum,
            buildNum,
            appList: zipList,
            capacity: zipFile.size,
            status: 'draft',
            instanceCount: 0,
            zipFilename: zipFile.name,
            zipFile: downloadURL,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          })
          .then(doc => {
            dispatch(
              newInstance(org_id, doc.id, () => {
                toast.success('Added new application')
              })
            )
            dispatch(addNotification(org_id, user.id, 'CREATE_APPLICATION', `Created new application - ${appName}.`))
            navigate(`/my-applications/${org_id}`)
            clear()
          })
          .catch(error => toast.error(error.message))

        dispatch({
          type: 'LOADING_FALSE'
        })
      }
    )

    dispatch({
      type: 'LOADING_FALSE'
    })
  }

  const checkStorageForUpload = async () => {
    dispatch({
      type: 'LOADING_TRUE'
    })

    const storageRef = firebase.storage().ref()
    const listRef = storageRef.child(`zip_files/${org_id}/${user.id}`)
    let totalCapacity = 0
    listRef
      .listAll()
      .then(async res => {
        // Use Promise.all to wait for all async operations to complete
        await Promise.all(
          res.items.map(async itemRef => {
            try {
              const metadata = await itemRef.getMetadata()
              // Access the size property of the metadata
              const fileSize = metadata.size
              totalCapacity += fileSize
            } catch (error) {
              // Handle errors getting metadata
              console.error(`Error getting metadata for ${itemRef.name}: ${error}`)
            }
          })
        )

        const organizationRef = await firebase.firestore().collection('organizations').doc(org_id)
        await organizationRef
          .collection('users')
          .doc(user.id)
          .get()
          .then(doc => {
            const storageCapacity = doc.data().storageCapacity
            if (storageCapacity > totalCapacity + zipFile.size) {
              handleCreateApplication()
            } else {
              toast.warn('The storage for application is not enough.')
            }
          })
      })
      .catch(error => console.log(error.message))

    dispatch({
      type: 'LOADING_FALSE'
    })
  }

  const clear = () => {
    setAppName('')
    setAppExeName('')
    setZipFile([])
    setZipList([])
  }

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {progress !== 0 && <LinearProgress variant='determinate' value={progress} />}
        </Grid>
        <Grid item xs={12} display={'flex'} justifyContent={'space-between'}>
          <Typography fontWeight={'bold'} fontSize={'18px'}>
            Create Application
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
                        <FormHelperText>Name*</FormHelperText>
                        <TextField value={appName} onChange={e => setAppName(e.target.value)}></TextField>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id='demo-simple-select-label'>Select EXE file*</InputLabel>
                        <Select
                          labelId='demo-simple-select-label'
                          id='demo-simple-select'
                          label='Select EXE'
                          value={appExeName}
                          onChange={e => setAppExeName(e.target.value)}
                        >
                          {zipList.map((listItem, index) => (
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
                          checkStorageForUpload()
                        }}
                      >
                        Create
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={6} marginTop={3}>
                  <Box display={'flex'} justifyContent={'center'} alignItems={'center'} flexDirection={'column'}>
                    <Typography marginBottom={2} fontWeight={'bold'} fontSize={18}>
                      Select Zip File*
                    </Typography>
                    <FileUploader handleChange={handleFileChange} name='file' types={fileTypes} />
                    <Typography marginTop={2} fontWeight={'bold'} fontSize={15}>
                      {zipFile ? `File name: ${zipFile.name}` : 'no files uploaded yet'}
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

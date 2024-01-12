// material-ui
import { Grid, Typography, Button, LinearProgress } from '@mui/material'

// project import
import MainCard from '../../components/MainCard'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { updatePassword, updateUserName } from '../../store/actions/settingActions'
import TextFieldForm from '../../components/common/TextFieldForm'

// ==============================|| SETTING PAGE ||============================== //

function Setting () {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { loading } = useSelector(state => state.loading)

  const [fullName, setFullName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  useEffect(() => {
    setFullName(user.fullName)
  }, [])

  const handleUpdatePassword = () => {
    if (password !== passwordConfirm) {
      toast.warn('The password and confirmation password must be the same.')
    } else {
      dispatch(
        updatePassword(currentPassword, password, () => {
          toast.success('Your account password is updated successfully.')
        })
      )
    }
  }

  const handleUpdateUserName = () => {
    dispatch(
      updateUserName(user.id, fullName, () => {
        toast.success('Your account name is updated successfully.')
      })
    )
  }

  return (
    <>
      <Grid container>
        {loading ? (
          <Grid item xs={12}>
            <LinearProgress />
          </Grid>
        ) : (
          ''
        )}
        <Grid item xs={12}>
          <Typography variant='h5'>Account Setting</Typography>
        </Grid>
        <Grid item xs={12} mt={2}>
          <MainCard>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography fontWeight={'bold'} fontSize={'15px'}>
                  Account Name
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextFieldForm type={'text'} value={fullName} setValue={setFullName} title={'Name'} />
              </Grid>
              <Grid item xs={8} display={'flex'} alignItems={'flex-end'}>
                <Button variant='contained' onClick={handleUpdateUserName}>
                  Save
                </Button>
              </Grid>
              <Grid item xs={12} mt={5}>
                <Typography fontWeight={'bold'} fontSize={'15px'}>
                  Account Password
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextFieldForm type={'password'} value={currentPassword} setValue={setCurrentPassword} title={'Current Password'} />
              </Grid>
              <Grid item xs={8}></Grid>
              <Grid item xs={12} md={4}>
                <TextFieldForm type={'password'} value={password} setValue={setPassword} title={'Password'} />
              </Grid>
              <Grid item xs={8}></Grid>
              <Grid item xs={12} md={4}>
                <TextFieldForm type={'password'} value={passwordConfirm} setValue={setPasswordConfirm} title={'Confirm Password'} />
              </Grid>
              <Grid item xs={8} display={'flex'} alignItems={'flex-end'}>
                <Button variant='contained' onClick={handleUpdatePassword}>
                  Save
                </Button>
              </Grid>
            </Grid>
          </MainCard>
        </Grid>
      </Grid>
    </>
  )
}

export default Setting

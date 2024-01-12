import { Fragment, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
// material-ui
import { Box, Grid, Typography, Stepper, StepLabel, Button, Step } from '@mui/material'

// project import
import MainCard from '../../components/MainCard'
import TextFieldForm from '../../components/common/TextFieldForm'
import { createOrganization } from '../../store/actions/organizationAction'
import { addNotification } from '../../store/actions/notificationAction'

const steps = ["Let's start with a name for your project", 'Create', 'Create']

export default function CreateOrganization () {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const { loading } = useSelector(state => state.loading)

  const [activeStep, setActiveStep] = useState(0)
  const [skipped, setSkipped] = useState(new Set())

  const [organizationName, setOrganizationName] = useState('')

  const handleNext = () => {
    let newSkipped = skipped

    setActiveStep(prevActiveStep => prevActiveStep + 1)
    setSkipped(newSkipped)
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
  }

  const handleCreateOrganization = () => {
    const userInfo = {
      id: user.id,
      email: user.email
    }
    dispatch(
      createOrganization(organizationName, userInfo, () => {
        navigate('/main-menu')
        toast.success('Created new organization.')
      })
    )
  }

  return (
    <Box>
      <Grid container>
        <Grid item xs={12} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          <Typography variant='h5'>Create a Organization</Typography>
          <Button
            variant='outlined'
            onClick={() => {
              navigate(-1)
            }}
          >
            Back
          </Button>
        </Grid>
      </Grid>
      <MainCard sx={{ mt: 2 }} content={false}>
        <Box padding={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} lg={3}></Grid>
            <Grid item xs={12} lg={6}>
              <Box sx={{ width: '100%' }}>
                <Stepper activeStep={activeStep}>
                  {steps.map((label, index) => {
                    const stepProps = {}
                    const labelProps = {}
                    return (
                      <Step key={index} {...stepProps}>
                        <StepLabel {...labelProps}>{label}</StepLabel>
                      </Step>
                    )
                  })}
                </Stepper>
                {activeStep === steps.length ? (
                  <Fragment>
                    <Typography sx={{ mt: 2, mb: 1 }}>All steps completed - you&apos;re finished</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                      <Box sx={{ flex: '1 1 auto' }} />
                      <Button disabled={loading} onClick={handleReset}>
                        Reset
                      </Button>
                      <Button disabled={loading} onClick={handleCreateOrganization}>
                        Create
                      </Button>
                    </Box>
                  </Fragment>
                ) : (
                  <Fragment>
                    <Box marginTop={3}>
                      {activeStep === 0 && (
                        <Box width={'100%'}>
                          <TextFieldForm
                            type={'text'}
                            value={organizationName}
                            setValue={setOrganizationName}
                            title={'Organization Name'}
                          />
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                        <Button color='inherit' disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                          Previous
                        </Button>
                        <Box sx={{ flex: '1 1 auto' }} />
                        <Button disabled={!organizationName} onClick={handleNext}>
                          {activeStep === steps.length ? 'Create' : 'Continue'}
                        </Button>
                      </Box>
                    </Box>
                  </Fragment>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </MainCard>
    </Box>
  )
}

import React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Slide from '@mui/material/Slide'
import { Typography, FormControl, FormHelperText, OutlinedInput } from '@mui/material'

const Transition = React.forwardRef(function Transition (props, ref) {
  return <Slide direction='up' ref={ref} {...props} />
})

export default function InputDialog (props) {
  return (
    <Dialog
      open={props.open}
      TransitionComponent={Transition}
      keepMounted
      onClose={() => props.setOpen(false)}
      aria-describedby='alert-dialog-slide-description'
    >
      <DialogTitle>
        <Typography fontWeight={'bold'} fontSize={'20px'}>
          Input
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-slide-description'>
          <FormControl sx={{ m: 1 }} variant='outlined'>
            <FormHelperText style={{ fontSize: '15px' }} id='outlined-weight-helper-text'>
              Name
            </FormHelperText>
            <OutlinedInput
              fullWidth
              id='outlined-adornment-weight'
              aria-describedby='outlined-weight-helper-text'
              inputProps={{
                'aria-label': 'weight'
              }}
              value={props.handleValue}
              onChange={e => props.handleChange(e.target.value)}
            />
          </FormControl>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => props.setOpen(false)}>Cancel</Button>
        <Button
          disabled={!props.handleValue}
          onClick={() => {
            props.handleAction()
            props.setOpen(false)
          }}
        >
          Okay
        </Button>
      </DialogActions>
    </Dialog>
  )
}

import { FormControl, FormHelperText, OutlinedInput } from '@mui/material'
import React from 'react'
import { useSelector } from 'react-redux'

export default function TextFieldForm (props) {
  const { user } = useSelector(state => state.auth)
  return (
    <>
      <FormControl fullWidth variant='outlined'>
        <FormHelperText style={{ fontSize: '15px' }} id='outlined-weight-helper-text'>
          {props.title}
        </FormHelperText>
        <OutlinedInput
          type={props.type}
          fullWidth
          id='outlined-adornment-weight'
          aria-describedby='outlined-weight-helper-text'
          inputProps={{
            'aria-label': 'weight'
          }}
          value={props.value}
          onChange={e => props.setValue(e.target.value)}
        />
      </FormControl>
    </>
  )
}

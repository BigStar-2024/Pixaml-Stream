import * as React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
}

export default function InformationModal (props) {
  return (
    <div>
      <Modal open={props.open} onClose={() => props.setOpen(false)}>
        <Box sx={style}>
          <Typography fontWeight={'bold'} fontSize={25}>
            Function
          </Typography>
          <Typography fontSize={18} sx={{ mt: 2 }}>
            {props.detail}
          </Typography>
        </Box>
      </Modal>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

// material-ui
import { Box, ListSubheader, Divider, MenuItem } from '@mui/material'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Grow from '@mui/material/Grow'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import MenuList from '@mui/material/MenuList'

// assets
import { getOrganizations } from '../../../../store/actions/mainmenuAction'

// ==============================|| HEADER CONTENT - SEARCH ||============================== //

function Search () {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, organizationID } = useSelector(state => state.auth)
  const { organizations } = useSelector(state => state.mainmenu)

  const { org_id } = useParams()

  const [selectOrg, setSelectOrg] = useState(organizationID)

  const changeOrg = org_id => {
    dispatch({
      type: 'SELECT_ORGANIZATION',
      payload: org_id
    })

    navigate(`/dashboard/${org_id}`)
  }

  useEffect(() => {
    dispatch(getOrganizations(user.id))
  }, [])

  const [open, setOpen] = useState(false)
  const anchorRef = useRef(null)

  const currentOrg = () => {
    const current = organizations.filter(org => org.id === organizationID)
    return current[0]?.organization
  }

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }

  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return
    }

    setOpen(false)
  }

  const handleEditOrganization = () => {
    navigate(`/edit-organization/${organizationID}`)
  }

  return (
    <Box sx={{ width: '100%', ml: { xs: 0, md: 1 } }}>
      <ButtonGroup variant='contained' ref={anchorRef} aria-label='split button'>
        <Button onClick={handleEditOrganization}>{currentOrg()}</Button>
        <Button
          size='small'
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label='select merge strategy'
          aria-haspopup='menu'
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        sx={{
          zIndex: 1
        }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom'
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id='split-button-menu' autoFocusItem>
                  <MenuItem
                    key={'allProjects'}
                    onClick={() => {
                      navigate('/main-menu')
                    }}
                    sx={{ fontWeight: 'bold' }}
                  >
                    See all projects
                  </MenuItem>
                  <Divider />
                  {organizations.map((option, index) => (
                    <MenuItem
                      key={index}
                      selected={option.id == selectOrg}
                      value={option.organization}
                      onClick={e => {
                        changeOrg(option.id)
                        setSelectOrg(option.id)
                        handleClose(e)
                      }}
                      sx={{ fontWeight: 'bold' }}
                    >
                      {option.organization}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
  )
}

export default Search

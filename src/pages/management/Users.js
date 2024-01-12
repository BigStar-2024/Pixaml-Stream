import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import firebase from '../../config/firebase'
import { useNavigate, useParams } from 'react-router-dom'

// material-ui
import {
  Box,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TableSortLabel,
  TablePagination,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  LinearProgress,
  useTheme,
  useMediaQuery,
  FormControl,
  FormHelperText,
  Select,
  MenuItem,
  Popover,
  Divider
} from '@mui/material'
import { visuallyHidden } from '@mui/utils'

// project import
import Dot from '../../components/@extended/Dot'
import { useDispatch, useSelector } from 'react-redux'
import MainCard from '../../components/MainCard'
import { toast } from 'react-toastify'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import SettingsIcon from '@mui/icons-material/Settings'
import { removeUserFromOrganization, sendInvitation } from '../../store/actions/managementAction'

function descendingComparator (a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

function getComparator (order, orderBy) {
  return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy)
}

function stableSort (array, comparator) {
  const stabilizedThis = array?.map((el, index) => [el, index])
  stabilizedThis?.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) {
      return order
    }
    return a[1] - b[1]
  })
  return stabilizedThis?.map(el => el[0])
}

// ==============================|| ORDER TABLE - HEADER CELL ||============================== //

const headCells = [
  {
    id: 'email',
    align: 'center',
    disablePadding: true,
    label: 'Email'
  },
  {
    id: 'role',
    align: 'center',
    disablePadding: false,
    label: 'Role'
  }
]

// ==============================|| ORDER TABLE - HEADER ||============================== //

function OrderTableHead (props) {
  const { order, orderBy, onRequestSort } = props
  const createSortHandler = property => event => {
    onRequestSort(event, property)
  }

  return (
    <TableHead>
      <TableRow>
        <TableCell align='center'>No</TableCell>
        {headCells.map((headCell, index) => (
          <TableCell
            key={index}
            align={headCell.align}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component='span' sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell align='center'>Actions</TableCell>
      </TableRow>
    </TableHead>
  )
}

const applyFilters = (tableItems, filters) => {
  return tableItems?.filter(tableItem => {
    let matches = true

    if (filters.status && tableItem.status !== filters.status) {
      matches = false
    }

    return matches
  })
}

const applyPagination = (tableItems, page, limit) => {
  return tableItems && tableItems.slice(page * limit, page * limit + limit)
}

OrderTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired
}

// ==============================|| ORDER TABLE - STATUS ||============================== //

const OrderStatus = ({ status }) => {
  let color
  let title

  switch (status) {
    case false:
      color = 'error'
      title = 'Deactive'
      break
    case true:
      color = 'primary'
      title = 'Active'
      break
  }

  return (
    <Stack direction='row' spacing={1} justifyContent={'center'} alignItems='center'>
      <Dot color={color} />
      <Typography>{title}</Typography>
    </Stack>
  )
}

OrderStatus.propTypes = {
  status: PropTypes.bool
}

// ==============================|| ORDER TABLE ||============================== //

export default function Users () {
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('')

  const [selected, setSelected] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [filters, setFilters] = useState({
    status: null
  })

  const { org_id } = useParams()

  const isSelected = id => selected.indexOf(id) !== -1

  // user definition
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const theme = useTheme()

  const matchs = useMediaQuery(theme.breakpoints.up('sm'))

  const [visibleRows, setVisibleRows] = useState([])
  const { user } = useSelector(state => state.auth)
  const { loading } = useSelector(state => state.API)
  const [rows, setRows] = useState([])

  const [selectedItem, setSelectedItem] = useState(null)
  const [memberEmail, setMemberEmail] = useState('')
  const [memberRole, setMemberRole] = useState('')
  const [updatedRole, setUpdatedRole] = useState('')

  // Add member dialog function
  const [addMemberDialog, setAddMemberDialog] = useState(false)
  const [convertRoleDialog, setConvertRoleDialog] = useState(false)

  // Handle Add Member function
  const handleAddMember = () => {
    dispatch(
      sendInvitation(org_id, memberEmail, () => {
        toast.success('Sent the invitation link')
      })
    )
  }

  const handleUpdateRole = () => {}

  useEffect(() => {
    const docRef = firebase.firestore().collection('organizations').doc(org_id)

    const unsubscribe = docRef.collection('users').onSnapshot(snapshot => {
      const updatedData = snapshot.docs.map(doc => {
        const email = doc.data().email
        const role = doc.data().role
        const id = doc.id
        return { id, email, role }
      })
      setRows(updatedData)
    })

    // Clean up the listener when component unmounts
    return () => unsubscribe()
  }, [])

  useEffect(() => {}, [selectedItem])

  useEffect(() => {
    setVisibleRows(rows)
  }, [rows])

  const [selectedID, setSelectedID] = useState('')
  const [openDialog, setOpenDialog] = useState(false)

  const handleUserRemove = () => {
    dispatch(
      removeUserFromOrganization(org_id, selectedID, () => {
        toast.success('Removed the user from organization')
      })
    )
  }

  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    let filteredObject = []
    rows?.map(item => {
      if (item.name?.toLocaleLowerCase().includes(searchValue) || item.email?.toLocaleLowerCase().includes(searchValue)) {
        filteredObject.push(item)
      }
    })
    setVisibleRows(filteredObject)
  }, [searchValue])

  // Popper
  const [anchorEl, setAnchorEl] = useState(null)

  const handlePopoverOpen = event => {
    setAnchorEl(event.currentTarget)
  }

  const handlePopoverClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  // MUI table setting
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  useEffect(() => {
    setVisibleRows(stableSort(rows, getComparator(order, orderBy)))
  }, [order, orderBy, page, rowsPerPage])

  const filteredTableItems = applyFilters(visibleRows, filters)
  const paginatedTableData = applyPagination(filteredTableItems, page, rowsPerPage)

  return (
    <Box>
      <Grid container>
        {loading ? (
          <Grid item xs={12}>
            <LinearProgress />
          </Grid>
        ) : (
          ''
        )}

        <Grid item xs={12} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          <Typography variant='h5'>Users</Typography>
          <TextField
            id='outlined-start-adornment'
            placeholder='Search by Name'
            sx={{ width: '250px' }}
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
          />
        </Grid>
        <Grid item mt={2} display={'flex'} alignItems={'center'} justifyContent={'flex-end'} xs={12}>
          <Button variant='contained' onClick={() => setAddMemberDialog(true)} fullWidth={!matchs}>
            Add member
          </Button>
        </Grid>
      </Grid>
      <MainCard sx={{ mt: 2 }} content={false}>
        <TableContainer
          sx={{
            width: '100%',
            overflowX: 'auto',
            position: 'relative',
            display: 'block',
            maxWidth: '100%',
            '& td, & th': { whiteSpace: 'nowrap' }
          }}
        >
          <Table
            aria-labelledby='tableTitle'
            sx={{
              '& .MuiTableCell-root:first-of-type': {
                pl: 2
              },
              '& .MuiTableCell-root:last-of-type': {
                pr: 3
              }
            }}
          >
            <OrderTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} rowCount={rows?.length} />
            <TableBody>
              {paginatedTableData &&
                paginatedTableData.map((row, index) => {
                  const isItemSelected = isSelected(row.id)

                  return (
                    <TableRow hover role='checkbox' sx={{ cursor: 'pointer' }} aria-checked={isItemSelected} tabIndex={-1} key={index}>
                      <TableCell align='center'>{index + 1 + page * rowsPerPage}</TableCell>
                      <TableCell align='center'>{row.email}</TableCell>
                      <TableCell
                        align='center'
                        onClick={() => {
                          setConvertRoleDialog(true)
                          setSelectedItem(row)
                          setUpdatedRole(row.role)
                        }}
                      >
                        <Box display={'flex'} justifyContent={'center'} alignItems={'center'}>
                          <Typography marginRight={1}>{row.role}</Typography>
                          <SettingsIcon
                            onMouseEnter={handlePopoverOpen}
                            onMouseLeave={handlePopoverClose}
                            sx={{ width: 15, marginRight: 1 }}
                          />
                          <Typography>{row.id === user.id && '(Me)'}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align='center' width={'15%'}>
                        <Box display={'flex'} justifyContent={'space-around'} alignItems={'center'}>
                          <Button
                            variant='contained'
                            disabled={row.id === user.id}
                            onClick={() => {
                              setOpenDialog(true)
                              setSelectedID(row.id)
                            }}
                            color='error'
                          >
                            Remove From Organization
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component='div'
          className='margin-none'
          count={rows?.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </MainCard>
      <Dialog
        open={addMemberDialog}
        onClose={() => setAddMemberDialog(false)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{'Do you want to add new member?'}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ width: matchs ? 600 : 300 }} id='alert-dialog-description'>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <FormControl fullWidth>
                  <FormHelperText>Email Address*</FormHelperText>
                  <TextField value={memberEmail} onChange={e => setMemberEmail(e.target.value)}></TextField>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <FormHelperText>Role</FormHelperText>
                  <Select
                    labelId='demo-simple-select-label'
                    id='demo-simple-select'
                    value={memberRole}
                    onChange={e => setMemberRole(e.target.value)}
                  >
                    <MenuItem value={'Admin'}>Admin</MenuItem>
                    <MenuItem value={'User'}>User</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' onClick={() => setAddMemberDialog(false)}>
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={() => {
              setAddMemberDialog(false)
              handleAddMember()
            }}
            autoFocus
          >
            Add member
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={convertRoleDialog}
        onClose={() => setConvertRoleDialog(false)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>
          <Typography fontWeight={'bold'} fontSize={15}>
            {selectedItem?.name}
          </Typography>
          <Typography>{selectedItem?.email}</Typography>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <DialogContentText sx={{ width: 300 }} id='alert-dialog-description'>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <FormHelperText>Role</FormHelperText>
                  <Select
                    labelId='demo-simple-select-label'
                    id='demo-simple-select'
                    selected={selectedItem?.role}
                    value={updatedRole}
                    onChange={e => setUpdatedRole(e.target.value)}
                  >
                    <MenuItem value={'admin'}>Admin</MenuItem>
                    <MenuItem value={'user'}>User</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' onClick={() => setConvertRoleDialog(false)}>
            Cancel
          </Button>
          <Button variant='contained' onClick={handleUpdateRole} autoFocus>
            Update Role
          </Button>
        </DialogActions>
      </Dialog>

      <Popover
        id='mouse-over-popover'
        sx={{
          pointerEvents: 'none'
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <Typography sx={{ p: 1 }}>This role includes broad access to Google Cloud resources and services for this project.</Typography>
      </Popover>
      <ConfirmDialog open={openDialog} setOpen={setOpenDialog} handleAction={handleUserRemove} />
    </Box>
  )
}

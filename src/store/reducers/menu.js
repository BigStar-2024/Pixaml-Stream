// types
import { createSlice } from '@reduxjs/toolkit'

// initial state
const initialState = {
  openItem: [''],
  defaultId: 'mainmenu',
  openComponent: 'buttons',
  drawerOpen: false,
  componentDrawerOpen: true,
  styleMode: 'light'
}

// ==============================|| SLICE - MENU ||============================== //

const menu = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    activeItem (state, action) {
      state.openItem = action.payload.openItem
    },

    activeComponent (state, action) {
      state.openComponent = action.payload.openComponent
    },

    openDrawer (state, action) {
      state.drawerOpen = action.payload.drawerOpen
    },

    openComponentDrawer (state, action) {
      state.componentDrawerOpen = action.payload.componentDrawerOpen
    },

    changeStyleMode (state, action) {
      state.styleMode = action.payload.styleMode
    }
  }
})

export default menu.reducer

export const { activeItem, activeComponent, openDrawer, openComponentDrawer, changeStyleMode } = menu.actions

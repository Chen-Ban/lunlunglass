import { configureStore } from '@reduxjs/toolkit'

import CustomersReducer from './Custormer'
import TemplatesReducer from './Template'

export type stateType = ReturnType<typeof store.getState>

const store = configureStore({
  reducer: {
    customers: CustomersReducer,
    templates: TemplatesReducer,
    // archives: ArchivesReducer,
  },
  // middleware: (getDefaultMiddleware) => {
  //   const middlewares = getDefaultMiddleware()
  //   middlewares.push(({ getState, dispatch }) => (next) => (action) => {
  //     if (action.type === 'templates/updateNodeActivation') {

  //       next(action)

  //       dispatch(updateTextNodeSelection({ templateId: action.payload.templateId }))

  //     } else {
  //       return next(action)
  //     }
  //   })

  //   return middlewares
  // },
})

export default store

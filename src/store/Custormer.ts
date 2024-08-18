import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { initialCustomers, SubmittedCustomer } from './types/Customer.types'

export const CustomerSlice = createSlice({
  name: 'customers',
  initialState: initialCustomers,
  reducers: {
    //初始化或者刷新时重置用户信息
    resetCustomers(_, action: PayloadAction<SubmittedCustomer[]>) {
      return action.payload
    },
    //分页时追加顾客信息
    pathchCustomers(customers: SubmittedCustomer[], action: PayloadAction<SubmittedCustomer[]>) {
      return [...customers, ...action.payload]
    },
    //拉黑标星顾客（在已经提交过的顾客上进行修改）或者修改顾客信息（除了拉黑和星标外还有新建档案时会修改）
    //修改isDelete，isImportant,lastArchive,archives字段
    //任何修改客户信息的场合下，客户信息都是已经提交过的
    updateCustomer(customers: SubmittedCustomer[], action: PayloadAction<Partial<SubmittedCustomer>>) {
      const _customer = action.payload
      return customers.map((customer) => {
        if ((customer as SubmittedCustomer).customerId == _customer.customerId) {
          customer = { ...customer, ..._customer }
        }
        return customer
      })
    },
    //单个删除和批量删除
    deleteCustomer(customers: SubmittedCustomer[], action: PayloadAction<string | string[]>) {
      return customers.filter((customer) => {
        if (typeof action.payload == 'string') {
          const customerId = action.payload
          return (customer as SubmittedCustomer).customerId != customerId
        } else {
          return !action.payload.includes((customer as SubmittedCustomer).customerId)
        }
      })
    },
  },
})
export const { resetCustomers, pathchCustomers, updateCustomer, deleteCustomer } = CustomerSlice.actions
export default CustomerSlice.reducer

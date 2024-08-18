import axiosInstance from './ajax'
import axios from 'axios'
import { Customer, SubmittedCustomer } from '../store/types/Customer.types'
const getCustomerById = async (id: string): Promise<Customer> => {
  return await axiosInstance.get(`/api/customer/${id}`)
}

export type PaginationParams = {
  pageNo: number
  pageSize: number
  isImportant?: boolean
  isDelete?: boolean
}

export type PageinationResType = {
  pageNo: number
  pageSize: number
  totalSize: number
  PageinationCustomers: SubmittedCustomer[]
}

const getCustomers = async ({
  pageNo,
  pageSize,
  isImportant,
  isDelete,
}: PaginationParams): Promise<PageinationResType> => {
  const queryParams = new URLSearchParams()
  queryParams.append('pageNo', pageNo.toString())
  queryParams.append('pageSize', pageSize.toString())
  typeof isImportant == 'boolean' && queryParams.append('isImportant', isImportant.toString())
  typeof isDelete == 'boolean' && queryParams.append('isDelete', isDelete.toString())

  const customersWithPagnation = (await axiosInstance.get(
    `/api/customer?${queryParams.toString()}`,
  )) as PageinationResType
  return customersWithPagnation
}

export type patchResType = {
  patchNum: number
  customer: SubmittedCustomer
}
export const pathchCustomerSource = axios.CancelToken.source()
const pathchCustomer = async (customer: Customer): Promise<patchResType> => {
  return await axiosInstance.patch(`/api/customer`, { customer }, { cancelToken: pathchCustomerSource.token })
}

export type updataResType = {
  updateNum: number
}
const updateCustomer = async (customer: Partial<Customer>[]): Promise<updataResType> => {
  return await axiosInstance.post(`/api/customer`, { customer })
}

export type deleteResType = {
  deleteNum: number
}
const deleteCustomer = async (customerIds: React.Key[]): Promise<deleteResType> => {
  const queryParams = new URLSearchParams()
  customerIds.forEach((id) => {
    queryParams.append('customerId', String(id))
  })
  return await axiosInstance.delete(`/api/customer`, { data: { customerIds } })
  // return await axiosInstance.delete(`/api/customer/${queryParams.toString()}`)
}
export { getCustomerById, getCustomers, updateCustomer, pathchCustomer, deleteCustomer }

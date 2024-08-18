import { useSelector, useDispatch } from 'react-redux'
import { stateType } from '../store'
import { Customer, SubmittedCustomer } from '../store/types/Customer.types'
import { resetCustomers, pathchCustomers, updateCustomer, deleteCustomer } from '../store/Custormer'

export function useGetCustomersData(): SubmittedCustomer[] {
  const customers = useSelector<stateType, SubmittedCustomer[]>((store) => store.customers)
  return customers
}

export function useResetCustomers() {
  const dispatch = useDispatch()
  return (customers: SubmittedCustomer[]) => {
    dispatch(resetCustomers(customers))
  }
}

export function usePathchCustomers() {
  const dispatch = useDispatch()
  return (customers: SubmittedCustomer[]) => {
    dispatch(pathchCustomers(customers))
  }
}

export function useUpdateCustomer() {
  const dispatch = useDispatch()
  return (customer: Partial<SubmittedCustomer>) => {
    dispatch(updateCustomer(customer))
  }
}

export function useDeleteCustomer() {
  const dispatch = useDispatch()
  return (customerId: string | string[]) => {
    dispatch(deleteCustomer(customerId))
  }
}

export function useGetOneCustomerById(customerId: string): Customer | undefined {
  const customers = useGetCustomersData() as SubmittedCustomer[]

  return customers.find((customer) => customer.customerId == customerId)
}

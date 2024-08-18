import { useEffect, useState } from 'react'
import { getCustomers, PaginationParams, PageinationResType } from '../services/customer'
import { useRequest } from 'ahooks'
import { useGetCustomersData, useResetCustomers, usePathchCustomers } from './useCustomersData'

/**
 * 拉取客户数据的hook
 * @param id 顾客id
 * 从服务器获取信息后，加入到store中
 */

export default function useFetchCustomersData({ pageNo, pageSize, isImportant, isDelete }: PaginationParams) {
  const customers = useGetCustomersData()
  const [done, setDone] = useState(false)
  const [totalSize, setTotalSize] = useState(0)
  const resetCustomers = useResetCustomers()
  const patchCustomers = usePathchCustomers()
  const { run, loading } = useRequest(getCustomers, {
    manual: true,
    loadingDelay: 1500,
    onSuccess({ PageinationCustomers, pageNo, pageSize, totalSize }: PageinationResType) {
      setTotalSize(totalSize)
      setDone(pageNo * pageSize >= totalSize)
      if (pageNo == 0 || isImportant || isDelete) {
        resetCustomers(PageinationCustomers)
      } else {
        patchCustomers(PageinationCustomers)
      }
    },
  })

  useEffect(() => {
    run({ pageNo, pageSize, isImportant, isDelete })
  }, [])
  return {
    run,
    done,
    loading,
    customers,
    totalSize,
  }
}

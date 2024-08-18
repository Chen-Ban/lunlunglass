import { useTitle } from 'ahooks'
import { Typography, Empty, Spin } from 'antd'
import { useRef, useMemo, useState } from 'react'

import { debounce } from '../../../utils/utils'
import UserCard from '../../../components/CustomerCard/CustomerCard'
import Search from '../../../components/Search/Search'
import styles from '../common.module.scss'
import useFetchCustomersData from '../../../hooks/useFetchCustomersData'
import useInterSectionOb from '../../../hooks/useIntersectionOb'
const { Title } = Typography

export default function List() {
  const [pageNo, setPageNo] = useState(1)
  const [pageSize, _] = useState(10)

  const { loading, customers, run, done } = useFetchCustomersData({
    pageNo,
    pageSize,
    isDelete: false,
  })
  const loadMoreRef = useRef<HTMLDivElement>(null)
  useInterSectionOb({
    element: loadMoreRef,
    callback: debounce((entries) => {
      if (entries[0].isIntersecting) {
        //不是初次加载,没有正在加载,还有数据没加载
        if (!loading && !done) {
          console.log('加载更多数据')
          run({ pageNo: pageNo + 1, pageSize, isDelete: false })
          setPageNo(pageNo + 1)
        }
      }
    }),
    options: useMemo(() => ({ rootMargin: '0px 0px 20px 0px' }), []),
  })

  useTitle('用户档案')

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={3}>档案列表</Title>
        <Search></Search>
      </div>

      <div className={styles.body}>
        <div className={styles.bodyWrapper}>
          {loading && pageNo == 1 ? (
            <Spin style={{ margin: '0 auto' }}></Spin>
          ) : customers.length == 0 ? (
            <Empty style={{ margin: '0 auto' }} description="暂无数据"></Empty>
          ) : (
            customers
              .filter((customer) => !customer.isDelete)
              .map((customer) => {
                return <UserCard key={customer.customerId} {...customer} />
              })
          )}
        </div>
        {!(loading && pageNo == 0) ? (
          <div ref={loadMoreRef} className={styles.footer}>
            {customers.length == 0 ? '' : done ? '到底了...' : loading ? <Spin></Spin> : ''}
          </div>
        ) : (
          ''
        )}
      </div>
    </div>
  )
}

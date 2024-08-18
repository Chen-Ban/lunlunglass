import { useTitle } from 'ahooks'
import { Typography, Empty, Spin, Pagination, PaginationProps } from 'antd'
import { useState } from 'react'

import UserCard from '../../../components/CustomerCard/CustomerCard'
import Search from '../../../components/Search/Search'
import styles from '../common.module.scss'
import useFetchCustomersData from '../../../hooks/useFetchCustomersData'
const { Title } = Typography

export default function List() {
  const [pageNo, setPageNo] = useState(1)
  const [pageSize, _] = useState(6)

  const { loading, customers, run, totalSize } = useFetchCustomersData({
    pageNo,
    pageSize,
    isImportant: true,
    isDelete: false,
  })

  useTitle('重要客户')

  const onPageNoChange: PaginationProps['onChange'] = (pageNo) => {
    setPageNo(pageNo)
    run({
      pageNo,
      pageSize,
      isImportant: true,
      isDelete: false,
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={3}>重要客户</Title>
        <Search></Search>
      </div>

      <div className={styles.body}>
        <div className={styles.bodyWrapper} style={{ marginBottom: '40px' }}>
          {loading ? (
            <Spin style={{ margin: '0 auto' }}></Spin>
          ) : customers.length == 0 ? (
            <Empty style={{ margin: '0 auto' }} description="暂无数据"></Empty>
          ) : (
            customers
              .filter((customer) => !customer.isDelete)
              .filter((customer) => customer.isImportant)
              .map((customer) => {
                return <UserCard key={customer.customerId} {...customer} />
              })
          )}
        </div>
        <Pagination
          style={{ marginBottom: '20px' }}
          current={pageNo}
          pageSize={pageSize}
          total={totalSize}
          onChange={onPageNoChange}
          simple
          showTotal={(total) => `共有 ${total} 条数据`}
          showQuickJumper
          showSizeChanger={false}
        ></Pagination>
      </div>
    </div>
  )
}

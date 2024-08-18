import React from 'react'
import { useTitle } from 'ahooks'
import { Typography, PaginationProps, Table, TableProps, Tag, Space, Button, message } from 'antd'
import { useState, useRef, useEffect } from 'react'

import Search from '../../../components/Search/Search'
import styles from '../common.module.scss'
import useFetchCustomersData from '../../../hooks/useFetchCustomersData'
import { Customer } from '../../../store/Custormer'

import { updateCustomer, deleteCustomer } from '../../../services/customer'
// import { useUpdateCustomer, useDeleteCustomer } from '../../../hooks/useCustomersData'
const { Title } = Typography

export default function List() {
  const [pageNo, setPageNo] = useState(1)
  const [pageSize, _] = useState(10)
  const selectedRowKeys = useRef<React.Key[]>([])

  // const updataCustomerInStore = useUpdateCustomer()
  // const deleteCustomerInStore = useDeleteCustomer()
  const { loading, customers, run, totalSize } = useFetchCustomersData({
    pageNo,
    pageSize,
    isDelete: true,
  })

  useTitle('黑名单')

  const onDelete = async (customerIds: React.Key[]): Promise<void> => {
    //发送请求
    const { deleteNum } = await deleteCustomer(customerIds)
    if (deleteNum == customerIds.length) {
      //更新redux
      // deleteCustomerInStore(customerIds)
      run({
        pageNo,
        pageSize,
        isDelete: true,
      })
      message.success('更新成功')
    } else {
      message.error('更新失败')
    }
  }

  const onRecover = async (customerIds: React.Key[]): Promise<void> => {
    const customers = []
    //组装数据
    for (const customerId of customerIds) {
      const customer: Partial<Customer> = {
        customerId,
        isDelete: false,
      } as Partial<Customer>
      customers.push(customer)
    }
    //发送请求
    const { updateNum } = await updateCustomer(customers)

    if (updateNum == customers.length) {
      //更新redux
      // updataCustomerInStore(customers)
      run({
        pageNo,
        pageSize,
        isDelete: true,
      })
      message.success('更新成功')
    } else {
      message.error('更新失败')
    }
  }

  const onPageNoChange: PaginationProps['onChange'] = (pageNo) => {
    setPageNo(pageNo)
    run({
      pageNo,
      pageSize,
      isDelete: true,
    })
  }

  const columns: TableProps<Customer>['columns'] = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <a>{name}</a>,
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: number) => <span>{gender === 1 ? '男' : gender === 0 ? '未知' : '女'}</span>,
    },
    {
      title: '手机号',
      key: 'phone',
      dataIndex: 'phone',
      render: (_, { phone }) => <Tag color="blue">{phone}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, { customerId }) => (
        <Space size="middle">
          <a onClick={() => onDelete([customerId])}>删除</a>
          <a onClick={() => onRecover([customerId])}>恢复</a>
        </Space>
      ),
    },
    {
      title: '是否被删除',
      key: 'isDelete',
      dataIndex: 'isDelete',
      render: (_, { isDelete }) => <Tag color={isDelete ? 'blue' : '#666'}>重要客户</Tag>,
    },
  ]

  const rowSelection = {
    onChange: (selected: React.Key[]) => {
      selectedRowKeys.current = selected
    },
  }

  useEffect(() => {
    console.log('store里面的customers数据变化了')
  }, [customers])
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={3}>黑名单</Title>
        <Search></Search>
      </div>

      <div className={styles.body}>
        <Space style={{ alignSelf: 'flex-start', margin: '10px 0' }}>
          <Button onClick={() => onDelete(selectedRowKeys.current)}>删除</Button>
          <Button onClick={() => onRecover(selectedRowKeys.current)}>恢复</Button>
        </Space>
        <div className={styles.bodyWrapper}>
          <Table
            dataSource={customers}
            columns={columns}
            rowKey={(customer) => customer.customerId}
            rowSelection={{
              type: 'checkbox',
              ...rowSelection,
            }}
            style={{ width: '100%' }}
            loading={loading}
            pagination={{
              current: pageNo,
              pageSize: pageSize,
              total: totalSize,
              onChange: onPageNoChange,
              simple: true,
              showTotal: (total) => `共有 ${total} 条数据`,
              showQuickJumper: true,
              showSizeChanger: false,
            }}
          ></Table>
        </div>
      </div>
    </div>
  )
}

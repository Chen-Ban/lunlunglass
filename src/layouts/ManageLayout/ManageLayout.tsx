import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import styles from './ManageLatout.module.scss'
import { Button, Space, Divider } from 'antd'
import { MANAGE_ADDUSER, PRINT_TEMPLATE, MANAGE_TRASH, MANAGE_START, MANAGE_LIST } from '../../router/index'
import { PlusOutlined, BarsOutlined, StarOutlined, DeleteOutlined } from '@ant-design/icons'

import { TemplateType } from '../../store/types/Template.type'

export default function MainLayout() {
  const nav = useNavigate()
  const { pathname } = useLocation()

  return (
    <div className={styles.container}>
      <Space direction="vertical" className={styles.left}>
        <Button type="primary" size="large" icon={<PlusOutlined></PlusOutlined>} onClick={() => nav(MANAGE_ADDUSER)}>
          新增用户
        </Button>
        <Divider style={{ borderTop: 'transparent' }}></Divider>
        <Button
          type={pathname.endsWith('list') ? 'default' : 'text'}
          size="large"
          icon={<BarsOutlined></BarsOutlined>}
          onClick={() => nav(MANAGE_LIST)}
        >
          档案列表
        </Button>
        <Button
          type={pathname.endsWith('start') ? 'default' : 'text'}
          size="large"
          icon={<StarOutlined></StarOutlined>}
          onClick={() => nav(MANAGE_START)}
        >
          重要客户
        </Button>
        <Button
          type={pathname.endsWith('trash') ? 'default' : 'text'}
          size="large"
          icon={<DeleteOutlined></DeleteOutlined>}
          onClick={() => nav(MANAGE_TRASH)}
        >
          黑名单
        </Button>
        <Button
          type={pathname.endsWith('template') ? 'default' : 'text'}
          size="large"
          icon={<DeleteOutlined></DeleteOutlined>}
          onClick={() => nav(PRINT_TEMPLATE + '/' + TemplateType.CUSTOMER + '/ac154124-12df-4fc8-b82f-1d2c5ce543bb')}
        >
          打印模板
        </Button>
      </Space>

      <div className={styles.right}>
        <Outlet />
      </div>
    </div>
  )
}

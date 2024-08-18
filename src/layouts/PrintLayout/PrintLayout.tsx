import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { Layout } from 'antd'

import Icon from '../../components/Icon/Icon'

import styles from './PrintLayout.module.scss'
const { Header, Content, Footer } = Layout

export default function PrintLayout() {
  const nav = useNavigate()
  const { pathname } = useLocation()
  return (
    <Layout>
      <Header className={styles.header}>
        <div
          className={styles.returnBtn}
          onClick={() => {
            nav(-1)
          }}
        >
          {pathname != '/' && (
            <>
              <Icon
                type="left"
                style={{
                  fontSize: '32px',
                  color: 'white',
                  marginLeft: '20px',
                }}
              ></Icon>
              <span style={{ fontSize: '22px' }}>返回</span>
            </>
          )}
        </div>
      </Header>

      <Content className={styles.main}>
        <Outlet></Outlet>
      </Content>
      <Footer className={styles.footer}>© Copyright 2024-2024 伦伦眼镜 All Rights Reserved</Footer>
    </Layout>
  )
}

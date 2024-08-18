import React from 'react'
import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from './MainLayout.module.scss'
import Logo from '../../components/Logo/Logo'
import UserInfo from '../../components/UserInfo/UserInfo'
import Icon from '../../components/Icon/Icon'
const { Header, Content, Footer } = Layout

export default function MainLayout() {
  const nav = useNavigate()
  const { pathname } = useLocation()

  return (
    <Layout>
      <Header className={styles.header}>
        <div>
          <Logo />
          {pathname.includes('-') && (
            <Icon
              type="left"
              style={{ fontSize: '32px', color: 'white', marginLeft: '20px' }}
              onClick={() => {
                nav(-1)
              }}
            ></Icon>
          )}
        </div>
        <div>
          <UserInfo></UserInfo>
        </div>
      </Header>
      <Content className={styles.main}>
        <Outlet></Outlet>
      </Content>
      <Footer className={styles.footer}>© Copyright 2024-2024 伦伦眼镜 All Rights Reserved</Footer>
    </Layout>
  )
}

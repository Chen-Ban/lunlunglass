import { useEffect } from 'react'
import { useTitle } from 'ahooks'
import { Typography, Space } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { Button, Checkbox, Form, Input } from 'antd'
import { Link } from 'react-router-dom'
import { REGISTER } from '../../router/index'
import type { FormProps } from 'antd'

import styles from './Login.module.scss'
const { Title } = Typography

type FieldType = {
  username: string
  password: string
  remember?: string
}
const USERNAME_KEY = 'username'
const PASSWORD_KEY = 'password'

const rememberUser = (username: string, password: string): void => {
  localStorage.setItem(USERNAME_KEY, username)
  localStorage.setItem(PASSWORD_KEY, password)
}
const deleteUser = (): void => {
  localStorage.removeItem(USERNAME_KEY)
  localStorage.removeItem(PASSWORD_KEY)
}

const getUser = (): FieldType => {
  return {
    username: localStorage.getItem(USERNAME_KEY) || '',
    password: localStorage.getItem(PASSWORD_KEY) || '',
  }
}
const onFinish: FormProps<FieldType>['onFinish'] = ({ username, password, remember }) => {
  if (remember) {
    rememberUser(username, password)
  } else {
    deleteUser()
  }
}

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
  console.log('Failed:', errorInfo)
}
export default function Login() {
  useTitle('登录页')
  const [form] = Form.useForm()
  useEffect(() => {
    const { username, password } = getUser()
    form.setFieldsValue({ username, password })
  }, [])
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Space>
          <Title level={2}>
            <UserOutlined />
          </Title>
          <Title level={2}>登录</Title>
        </Space>
      </div>
      <div className={styles.body}>
        <Form
          name="basic"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          form={form}
        >
          <Form.Item<FieldType>
            label="用户名"
            name="username"
            rules={[
              { required: true, message: 'Please input your username!' },
              { pattern: /^\w+$/, message: '只能是字母数字下划线' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="密码"
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { type: 'string', min: 5, max: 20 },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item<FieldType> name="remember" valuePropName="checked" wrapperCol={{ offset: 4, span: 16 }}>
            <Checkbox>保存用户名、密码</Checkbox>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
            <Space size={32}>
              <Button type="primary" htmlType="submit">
                登录
              </Button>
              <Link to={REGISTER}>注册用户</Link>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

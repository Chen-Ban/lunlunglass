import React from 'react'
import { useTitle } from 'ahooks'
import { Typography, Space } from 'antd'
import { UserAddOutlined } from '@ant-design/icons'
import type { FormProps } from 'antd'
import { Button, Checkbox, Form, Input } from 'antd'
import { Link } from 'react-router-dom'
import { LOGIN } from '../../router/index'
import styles from './Register.module.scss'
const { Title } = Typography

type FieldType = {
  username?: string
  password?: string
  remember?: string
  confirm?: string
}
const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
  console.log('Success:', values)
}

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
  console.log('Failed:', errorInfo)
}
export default function Login() {
  useTitle('注册')
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Space>
          <Title level={2}>
            <UserAddOutlined />
          </Title>
          <Title level={2}>注册</Title>
        </Space>
      </div>
      <div className={styles.body}>
        <Form
          name="basic"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          // style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
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
          <Form.Item<FieldType>
            label="确认密码"
            name="confirm"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, val) {
                  if (!val || getFieldValue('password') === val) {
                    return Promise.resolve()
                  } else {
                    return Promise.reject(new Error('两次密码不一致'))
                  }
                },
              }),
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
                注册
              </Button>
              <Link to={LOGIN}>已有账户,登录</Link>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

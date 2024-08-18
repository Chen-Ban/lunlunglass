import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { HOME } from '../../router'
import { useTitle } from 'ahooks'

export default function NotFound() {
  const nav = useNavigate()
  useTitle('出错了')
  return (
    <Result
      status="404"
      title="出错了"
      subTitle="页面好像出现了点问题, 请联系管理员"
      extra={
        <Button type="primary" size="large" onClick={() => nav(HOME)}>
          返回首页
        </Button>
      }
    />
  )
}

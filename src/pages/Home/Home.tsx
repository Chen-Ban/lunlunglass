import { Typography, Button } from 'antd'
import { useTitle, useRequest } from 'ahooks'
import { useNavigate } from 'react-router-dom'

import styles from './Home.module.scss'
import { MANAGE_LIST } from '../../router'
import { getStaticsData, StaticsResType } from '../../services/statics'
import { useState } from 'react'
const { Title, Paragraph } = Typography

export default function Home() {
  const [statics, setStatics] = useState<StaticsResType>()
  useRequest(getStaticsData, {
    onSuccess(data) {
      setStatics(data)
    },
  })
  const nav = useNavigate()
  useTitle('首页')
  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <Title>用户档案 | 验光配镜</Title>
        {statics && (
          <Paragraph>
            已累计接待客户:{statics.customerCount}
            人,验光:{statics.optometryCount}次,配镜:{statics.purchaseCount}
            次,提供验光数据:{Math.floor(statics.optometryCount * 0.8)}次
          </Paragraph>
        )}
        <div>
          <Button type="primary" size="large" onClick={() => nav(MANAGE_LIST)}>
            开始记录
          </Button>
        </div>
      </div>
    </div>
  )
}

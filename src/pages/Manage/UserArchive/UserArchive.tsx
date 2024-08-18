import { useTitle } from 'ahooks'
import { useLocation } from 'react-router-dom'
import { Typography, Tag } from 'antd'

import { useGetOneCustomerById } from '../../../hooks/useCustomersData'
import AddArchive from './AddArchive/AddArchive'
import styles from './UserArchive.module.scss'
import { Customer } from '../../../store/types/Customer.types'
import Icon from '../../../components/Icon/Icon'
const { Title } = Typography

export default function UserArchive() {
  const { pathname } = useLocation()
  const customerId = pathname.split('/')[2]
  const customer = useGetOneCustomerById(customerId) as Customer

  useTitle('档案')
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={3}>用户信息</Title>
      </div>
      <div className={styles.body}>
        <div className={styles.bodyWrapper}>
          <div className={styles.infoSection}>
            <div className={styles.profileSection}>
              <div className={styles.profileWrapper}>
                <img src={customer.imgSrc} />
              </div>
            </div>
            <div className={styles.descriptionSection}>
              <div className={styles.basicInfoSection}>
                <p>姓名:{customer?.name}</p>
                <p>年龄:{customer?.age}</p>
                <p>性别:{customer?.gender}</p>
              </div>
              <div className={styles.tagsSection}>
                {customer?.isImportant ? <Tag>重要客户</Tag> : ''}
                <Tag>{customer?.phone}</Tag>
                <Tag>验光{customer?.optometry}次</Tag>
                <Tag>购买{customer?.purchase}次</Tag>
              </div>
            </div>
          </div>
          <div className={styles.archiveSection}>
            <div className={styles.archiveWrapper}>
              <Icon
                type="leftArrow"
                style={{
                  position: 'absolute',
                  top: '50%',
                  translate: '20px -50%',
                  fontSize: '24px',
                }}
              ></Icon>
              <Icon
                type="rightArrow"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  translate: '-20px -50%',
                  fontSize: '24px',
                }}
              ></Icon>
              {/* {customer?.archives.map((archiveId) => (
                <div key={archiveId} className={styles.archiveItemWrapper}>
                  <Archive archiveId={archiveId} />
                </div>
              ))} */}
              {<AddArchive customerId={customerId}></AddArchive>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

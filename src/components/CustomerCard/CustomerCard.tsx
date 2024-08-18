import day from 'dayjs'
import { Space, Tag, Popconfirm } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import classNames from 'classnames'

import Icon from '../Icon/Icon'
import styles from './CustomerCard.module.scss'
import { Customer } from '../../store/Custormer'
import { useUpdateCustomer } from '../../hooks/useCustomersData'
import { MANAGE } from '../../router'
import { updateCustomer } from '../../services/customer'

export default function UserCard(customer: Customer) {
  const nav = useNavigate()
  const updateCustomerInStore = useUpdateCustomer()
  const [containerClass, setContainerClass] = useState<string>('')
  const d = day(customer.lastArchive.timeStamp)

  async function onStar() {
    await updateCustomer([
      {
        isImportant: !customer.isImportant,
        customerId: customer.customerId,
      },
    ])
    updateCustomerInStore([
      {
        isImportant: !customer.isImportant,
        customerId: customer.customerId,
      },
    ])
  }
  async function onDelete() {
    await updateCustomer([
      {
        isDelete: true,
        customerId: customer.customerId,
      },
    ])
    updateCustomerInStore([{ isDelete: true, customerId: customer.customerId }])
  }
  useEffect(() => {
    console.log('111')

    if (customer) {
      setContainerClass(classNames(styles.enter, styles.container))
      setTimeout(() => {
        setContainerClass(classNames(styles.container))
      }, 0)
    } else {
      setContainerClass(classNames(styles.container, styles.exit))
      // setTimeout(() => {
      //   setContainerClass(classNames(styles.container))
      // }, 600)
    }
  }, [customer])
  return (
    <div className={containerClass}>
      <div className={styles.containerWrapper} onClick={() => nav(`${MANAGE}/${customer.customerId}`)}>
        <Space className={styles.iconWrapper} onClick={(e) => e.stopPropagation()}>
          <Icon
            style={{
              fontSize: '24px',
            }}
            type={customer.isImportant ? 'star' : 'unStar'}
            onClick={onStar}
          ></Icon>
          <Popconfirm
            title="拉黑客户"
            description="是否拉黑该客户"
            onConfirm={onDelete}
            onOpenChange={() => console.log('open change')}
          >
            <Icon
              style={{
                fontSize: '24px',
              }}
              type="cancel"
            ></Icon>
          </Popconfirm>
        </Space>
        <div className={styles.profileWrapper}>
          <img src={customer.imgSrc} alt="顾客封面" />
        </div>
        <div className={styles.infoList}>
          <Space size={32} className={styles.infoListWrapper}>
            <div className={styles.nameInfoWrapper}>
              <span className={styles.name}>{customer.name}</span>
              <span className={styles.id}>#{customer.customerId}</span>
            </div>
            <div className={styles.basicInfo}>
              <Space size={20}>
                <div className={styles.sightWrapper}>
                  <span>左眼:</span>
                  <span>{customer.lastArchive.sight.left.nearsighted}°</span>
                  <span>{customer.lastArchive.sight.left.astigmatism}°</span>
                  <span>{customer.lastArchive.sight.left.pupilDistance}mm</span>
                </div>
                <div className={styles.sightWrapper}>
                  <span>右眼:</span>
                  <span>{customer.lastArchive.sight.right.nearsighted}°</span>
                  <span>{customer.lastArchive.sight.right.astigmatism}°</span>
                  <span>{customer.lastArchive.sight.right.pupilDistance}mm</span>
                </div>
              </Space>
            </div>
            <div className={styles.tags}>
              <Tag>验光:{customer.optometry}</Tag>
              <Tag>配镜:{customer.purchase}</Tag>
              <Tag>{d.format('YYYY-MM-DD')}</Tag>
            </div>
          </Space>
        </div>
      </div>
    </div>
  )
}

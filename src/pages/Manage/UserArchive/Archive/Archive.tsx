import { useState, useEffect } from 'react'
import { useRequest } from 'ahooks'
import { Spin } from 'antd'
import classNames from 'classnames'

import { getSingleArchive, getArchiveResType, getArchiveParamsType } from '../../../../services/archive'
import { initialDisplayArchive, Archive as ArchiveType } from '../../../../store/types/Archive.types'
import styles from './Archive.module.scss'
import Icon from '../../../../components/Icon/Icon'

export default function Archive({ archiveId }: getArchiveParamsType) {
  const [archive, setArchive] = useState<ArchiveType>(initialDisplayArchive)
  const { run, loading } = useRequest(getSingleArchive, {
    manual: true,
    onSuccess({ archive }: getArchiveResType) {
      setArchive(archive)
    },
  })
  useEffect(() => {
    run({ archiveId })
  }, [archiveId])
  if (loading) {
    return <Spin></Spin>
  }
  return (
    <div className={styles.container}>
      <div className={styles.body}>
        <div className={classNames(styles.infoWrapper, styles.sightWrapper)}>
          <div className={classNames(styles.sightItemWrapper, styles.infoItemWrapper)}>
            <span className={styles.label}>视力:</span>
            <div className={styles.itemWrapper}>
              <Icon type="zuoyan"></Icon>
              <span>{archive.sight.left.nearsighted}°</span>
            </div>
            <div className={styles.itemWrapper}>
              <Icon type="youyan"></Icon>
              <span>{archive.sight.right.nearsighted}°</span>
            </div>
          </div>
          <div className={classNames(styles.sightItemWrapper, styles.infoItemWrapper)}>
            <span className={styles.label}>瞳距:</span>
            <div className={styles.itemWrapper}>
              <Icon type="distance"></Icon>
              <span>{archive.sight.left.pupilDistance}°</span>
            </div>
            <div className={styles.itemWrapper}>
              <Icon type="distance"></Icon>
              <span>{archive.sight.right.pupilDistance}°</span>
            </div>
          </div>
          <div className={classNames(styles.sightItemWrapper, styles.infoItemWrapper)}>
            <span className={styles.label}>散光:</span>
            <div className={styles.itemWrapper}>
              <Icon type="diffuse"></Icon>
              <span>{archive.sight.left.astigmatism}°</span>
            </div>
            <div className={styles.itemWrapper}>
              <Icon type="diffuse"></Icon>
              <span>{archive.sight.right.astigmatism}°</span>
            </div>
          </div>
        </div>
        <div className={classNames(styles.infoWrapper, styles.prescriptionWrapper)}>
          <div className={classNames(styles.sightItemWrapper, styles.infoItemWrapper)}>
            <span className={styles.label}>球镜:</span>
            <div className={styles.itemWrapper}>
              <Icon type="zuoyan"></Icon>
              <span>{archive.prescription.left.spherical}°</span>
            </div>
            <div className={styles.itemWrapper}>
              <Icon type="youyan"></Icon>
              <span>{archive.prescription.right.spherical}°</span>
            </div>
          </div>

          <div className={classNames(styles.sightItemWrapper, styles.infoItemWrapper)}>
            <span className={styles.label}>矫正视力:</span>
            <div className={styles.itemWrapper}>
              <Icon type="zuoyan"></Icon>
              <span>{archive.prescription.left.adjustSight}°</span>
            </div>
            <div className={styles.itemWrapper}>
              <Icon type="youyan"></Icon>
              <span>{archive.prescription.right.adjustSight}°</span>
            </div>
          </div>
          <div className={classNames(styles.sightItemWrapper, styles.infoItemWrapper)}>
            <span className={styles.label}>柱镜:</span>
            <div className={styles.itemWrapper}>
              <Icon type="zuoyan"></Icon>
              <span>{archive.prescription.left.cylinder}°</span>
            </div>
            <div className={styles.itemWrapper}>
              <Icon type="youyan"></Icon>
              <span>{archive.prescription.right.cylinder}°</span>
            </div>
          </div>
          <div className={classNames(styles.sightItemWrapper, styles.infoItemWrapper)}>
            <span className={styles.label}>轴向:</span>
            <div className={styles.itemWrapper}>
              <Icon type="zuoyan"></Icon>
              <span>{archive.prescription.left.axial}°</span>
            </div>
            <div className={styles.itemWrapper}>
              <Icon type="youyan"></Icon>
              <span>{archive.prescription.right.axial}°</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <button>打印</button>
      </div>
    </div>
  )
}

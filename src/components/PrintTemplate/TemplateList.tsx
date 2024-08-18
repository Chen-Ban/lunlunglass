import React from 'react'
import { Suspense } from 'react'
import { Spin } from 'antd'
import { NodeType, RenderOptions } from 'store/types/Template.type'
import styles from './TemplateList.module.scss'
import textComponents from './TextTemplate/builtIn'
import pictureComponents from './PictureTemplate/builtIn'
import barcodeComponents from './BarcodeTemplate/builtIn'
import tableComponents from './TableTemplate/builtIn'
import polygonComponents from './PolygonTemplate/builtIn'
import { TemplateComponentProps } from './TemplateCompProps.type'

const templateComponentList: Record<NodeType, TemplateComponentProps<RenderOptions>[]> = {
  [NodeType.TEXT]: textComponents,
  [NodeType.PICTURE]: pictureComponents,
  [NodeType.BARCODE]: barcodeComponents,
  [NodeType.TABLE]: tableComponents,
  [NodeType.POLYGON]: polygonComponents,
}

export default function TemplateList() {
  return (
    <div className={styles.container}>
      <div className={styles.componentsHeader}>组件列表</div>
      {Object.keys(templateComponentList).map((renderType) => {
        return (
          <div key={renderType} className={styles.itemListWrapper}>
            <div className={styles.title}>{templateComponentList[renderType as NodeType][0]['type']}</div>
            <div className={styles.itemList}>
              {templateComponentList[renderType as NodeType].map((comp) => {
                return (
                  <Suspense key={comp.componentId} fallback={<Spin />}>
                    <div className={styles.item}>{<comp.component {...comp}></comp.component>}</div>
                  </Suspense>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

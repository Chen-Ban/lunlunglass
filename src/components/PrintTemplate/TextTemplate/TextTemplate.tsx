import React from 'react'
import styles from './TexTemplate.module.scss'
import { TemplateComponentProps } from '../TemplateCompProps.type'
import { CanvasNode, NodeType, RenderOptions, RenderTextOptions, Selection } from 'store/types/Template.type'
import { v4 as uuid } from 'uuid'
import { parseColor } from 'src/utils/utils'

const generateTextNode = (
  componentId: CanvasNode['componentId'],
  propName: CanvasNode['propName'],
  options: RenderOptions,
) => {
  return {
    componentId,
    instanceId: uuid(),

    isActive: true,
    propName,

    type: NodeType.TEXT,
    options,
  } as CanvasNode
}

export default function textTemplate({
  componentId,
  componentName,
  propName,
  options,
}: TemplateComponentProps<RenderTextOptions>) {
  const onDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const node = generateTextNode(componentId, propName, options)

    e.dataTransfer.setData('application/json:node', JSON.stringify(node)) //不能使用引用数据，不拷贝原型属性，不序列化函数，symbol
    e.dataTransfer.setData('text/plain:name', componentName)
  }

  return (
    <div className={styles.container} onDragStart={onDragStart} draggable="true">
      {Object.values(options.paragrahs).map((pOptions) => {
        return (
          <div key={pOptions.paragrahIndex}>
            {Object.values(pOptions.rows).map((rOptions) => {
              return (
                <div key={rOptions.rowIndex}>
                  {Object.keys(rOptions.font).map((selection) => {
                    const { fontFamily, fontSize, fontWeight, color, italicly, underLine } =
                      rOptions.font[selection as Selection]
                    return (
                      <span
                        key={`${selection}`}
                        style={{
                          fontFamily,
                          fontSize: fontSize / 2,
                          fontWeight,
                          color: parseColor(color),
                          fontStyle: italicly ? 'italic' : 'normal',
                          textDecoration: underLine ? 'underline black' : 'none',
                        }}
                      >
                        {componentName.slice(...selection.split('-').map((item) => parseInt(item)))}
                      </span>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

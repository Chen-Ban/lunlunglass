import { CSSProperties } from 'react'
import { createFromIconfontCN } from '@ant-design/icons'

type Props = {
  type?: string
  style?: CSSProperties
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
}

const defaultProps: Props = {
  type: 'zuoyan',
  style: {},
}

const IconFont = createFromIconfontCN({
  scriptUrl: ['//at.alicdn.com/t/c/font_4583841_h3cunkvm7y.js'],
})

export default function Icon({ type, style, onClick }: Props = defaultProps) {
  return <IconFont type={`icon-${type}`} style={style} onClick={onClick}></IconFont>
}

import { lazy } from 'react'
import { RenderTableOptions } from 'src/store/types/Template.type'

export default [
  {
    componentId: '0004-001',
    componentName: '普通表格',
    component: lazy(() => import('./TableTemplate')),
    propName: 'normalTable',
    options: {} as RenderTableOptions,
    type: '表格',
  },
  {
    componentId: '0004-002',
    componentName: '目录式表格',
    component: lazy(() => import('./TableTemplate')),
    propName: 'cataTable',
    options: {} as RenderTableOptions,
    type: '表格',
  },
]

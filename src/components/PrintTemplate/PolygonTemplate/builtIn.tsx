import { lazy } from 'react'
import { RenderPolygonOptions } from 'src/store/types/Template.type'

export default [
  {
    componentId: '0005-001',
    componentName: '直线',
    component: lazy(() => import('./PolygonTemplate')),
    propName: 'line',
    options: {} as RenderPolygonOptions,
    type: '图形',
  },
  {
    componentId: '0005-002',
    componentName: '圆弧',
    component: lazy(() => import('./PolygonTemplate')),
    propName: 'arc',
    type: '图形',
    options: {} as RenderPolygonOptions,
  },
  {
    componentId: '0005-003',
    componentName: '二次贝塞尔曲线',
    component: lazy(() => import('./PolygonTemplate')),
    propName: 'quadraBessel',
    type: '图形',
    options: {} as RenderPolygonOptions,
  },
  {
    componentId: '0005-004',
    componentName: '折线',
    component: lazy(() => import('./PolygonTemplate')),
    propName: 'brokenLine',
    type: '图形',
    options: {} as RenderPolygonOptions,
  },
  {
    componentId: '0005-005',
    componentName: '波浪线',
    component: lazy(() => import('./PolygonTemplate')),
    propName: 'wave',
    type: '图形',
    options: {} as RenderPolygonOptions,
  },
]

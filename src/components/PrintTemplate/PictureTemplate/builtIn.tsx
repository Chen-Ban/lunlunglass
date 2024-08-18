import { lazy } from 'react'
import { RenderPictureOptions } from 'src/store/types/Template.type'
export default [
  {
    componentId: '0002-001',
    componentName: '图片',
    component: lazy(() => import('./PictureTemplate')),
    propName: 'picture1',
    options: {} as RenderPictureOptions,
    type: '图片',
  },
]

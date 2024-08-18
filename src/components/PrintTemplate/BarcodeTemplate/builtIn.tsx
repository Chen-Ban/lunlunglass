import { lazy } from 'react'
import { RenderBarcodeOptions } from 'src/store/types/Template.type'

export default [
  {
    //规范很多，简化成条形码和二维码
    componentId: '0003-001',
    componentName: '条形码',
    component: lazy(() => import('./BarcodeTemplate')),
    propName: 'barcode',
    options: {} as RenderBarcodeOptions,
    type: '条码',
  },
  {
    componentId: '0003-002',
    componentName: '二维码',
    component: lazy(() => import('./BarcodeTemplate')),
    options: {} as RenderBarcodeOptions,
    propName: 'QRCode',
    type: '条码',
  },
]

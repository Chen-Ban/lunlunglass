import { Random, mock } from 'mockjs'
import { v4 as uuid } from 'uuid'

import { Sight, Prescription, initialSight, initialPrescription } from './Archive.types'

export type Commodity = {
  CommodityId: string
  name: string
  num: number
  unitPrice: number
}
//在打印时会选择打印类型（顾客联或者验光联），在那个时候组装数据组成打印模板数据
export type BaseTemplateData = {
  title: string
  printId: string
  timeStamp: number
  outlets: string
  saleman: string
  customerName: string
  customerPhone: string

  remark: string
  phone: string
  address: string
  QRCodeURL: string
  [propName: string]: any
}

export type SightTemplateData = BaseTemplateData & {
  sight: Sight
}

export type PrescriptionTemplateData = SightTemplateData & {
  prescription: Prescription
}

export type CustomerTemplateData = SightTemplateData & {
  commoditys?: Commodity[]
  totalPrice?: number
}

export type TemplateData = BaseTemplateData | SightTemplateData | PrescriptionTemplateData | CustomerTemplateData

export const isCustomerTemplateData = (data: any): data is CustomerTemplateData => {
  return ('sight' in data && !('prescription' in data)) || 'commoditys' in data || 'totalPrice' in data
}

export const isSightTemplateData = (data: any): data is SightTemplateData => {
  return 'sight' in data && !('prescription' in data) && !('commoditys' in data) && !('totalPrice' in data)
}

export const isPrescriptionTemplateData = (data: any): data is PrescriptionTemplateData => {
  return 'sight' in data && 'prescription' in data
}

export const initialTemplateData: TemplateData = {
  title: '绵阳伦伦眼镜',
  printId: uuid(),
  timeStamp: Number(Random.date('T')),
  outlets: '绵阳伦伦眼镜',
  saleman: '项雨伦',
  customerName: Random.cname(),
  customerPhone: mock(/^1[3-9]\d{9}$/),

  remark: Random.csentence(),
  phone: '19921870014',
  address: '绵阳市涪城区万达广场万达公馆56-31号',
  QRCodeURL: Random.url(),
  sight: initialSight,
  prescription: initialPrescription,
  commoditys: [],
  totalPrice: 0,
}

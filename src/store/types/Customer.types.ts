import { FormArchive, SubmittedArchive, initialFormArchive, initialSubmittedArchive } from './Archive.types'
import { Random, mock } from 'mockjs'
export enum Gender {
  Unknown = 0,
  Male = 1,
  Female = -1,
}

export type BaseCustomer = {
  //基础
  name: string
  age: number
  gender: Gender
  phone: string
  imgSrc: string
  isImportant: boolean
  //默认
  isDelete: boolean
  optometry: number
  purchase: number
  //档案
  lastArchive: FormArchive
  archives: string[]
}

export type FormCustomer = BaseCustomer

export type DisplayCustomer = BaseCustomer & {
  customerId: string
  lastArchive: SubmittedArchive | FormArchive
  archives: string[]
}

export type SubmittedCustomer = DisplayCustomer

export type Customer = BaseCustomer | FormCustomer | DisplayCustomer | SubmittedCustomer

export const initialBaseCustomer: BaseCustomer = {
  name: Random.cname(),
  age: Random.integer(3, 150),
  gender: Gender.Male,
  imgSrc: Random.image('300'),
  isImportant: Random.boolean(),
  isDelete: Random.boolean(),
  phone: mock(/^1[3-9]\d{9}$/),
  optometry: Random.integer(0),
  purchase: Random.integer(0),
  lastArchive: initialFormArchive,
  archives: [],
}

export const initialFormCustomer: FormCustomer = initialBaseCustomer

export const initialDisplayCustomer: DisplayCustomer = {
  customerId: initialSubmittedArchive.customerId,
  name: Random.cname(),
  age: Random.integer(3, 150),
  gender: Gender.Male,
  imgSrc: Random.image('300'),
  isImportant: Random.boolean(),
  isDelete: Random.boolean(),
  phone: mock(/^1[3-9]\d{9}$/),
  optometry: Random.integer(0),
  purchase: Random.integer(0),
  lastArchive: initialSubmittedArchive,
  archives: [initialSubmittedArchive.archiveId],
}

export const initialSubmittedCustomer: SubmittedCustomer = initialDisplayCustomer

export const initialCustomers: SubmittedCustomer[] = []

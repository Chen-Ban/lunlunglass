import { Random } from 'mockjs'
import { v4 as uuid } from 'uuid'
type SightData = {
  nearsighted: number //近视程度
  astigmatism: number //散光
  pupilDistance: number //瞳距
}

export type Sight = {
  left: SightData
  right: SightData
}

type PrescriptionData = {
  spherical: number //球镜
  adjustSight: number //矫正视力
  cylinder: number //柱镜
  axial: number //轴向
}

export type Prescription = {
  left: PrescriptionData
  right: PrescriptionData
}

type BaseArchive = {
  sight: Sight
  prescription: Prescription
}
export type DisplayArchive = BaseArchive & {
  timeStamp: number
}
export type FormArchive = BaseArchive
export type SubmittedArchive = BaseArchive & {
  customerId: string
  archiveId: string
  timeStamp: number
}
export type Archive = BaseArchive | DisplayArchive | FormArchive | SubmittedArchive

export const initialSight: Sight = {
  left: {
    nearsighted: Random.integer(0, 30) * 50, //近视程度
    astigmatism: Random.integer(0, 30) * 50, //散光
    pupilDistance: Random.integer(30, 50), //瞳距
  },
  right: {
    nearsighted: Random.integer(0, 30) * 50, //近视程度
    astigmatism: Random.integer(0, 30) * 50, //散光
    pupilDistance: Random.integer(30, 50), //瞳距
  },
}

export const initialPrescription: Prescription = {
  left: {
    spherical: Random.integer(30, 50), //球镜
    adjustSight: Random.integer(0, 2), //矫正视力
    cylinder: Random.integer(30, 50), //柱镜
    axial: Random.integer(30, 50), //轴向
  },
  right: {
    spherical: Random.integer(30, 50), //球镜
    adjustSight: Random.integer(0, 2), //矫正视力
    cylinder: Random.integer(30, 50), //柱镜
    axial: Random.integer(30, 50), //轴向
  },
}

export const initialBaseArchive: BaseArchive = {
  sight: initialSight,
  prescription: initialPrescription,
}

export const initialDisplayArchive: DisplayArchive = {
  sight: initialSight,
  prescription: initialPrescription,
  timeStamp: parseInt(Random.date('T')),
}

export const initialFormArchive: FormArchive = initialBaseArchive

export const initialSubmittedArchive: SubmittedArchive = {
  sight: initialSight,
  prescription: initialPrescription,
  customerId: uuid(),
  archiveId: uuid(),
  timeStamp: parseInt(Random.date('T')),
}

export const initialArchives: Archive[] = []

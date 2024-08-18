import axios from './ajax'
import { Archive } from '../store/types/Archive.types'

export type getArchiveParamsType = {
  archiveId: string
}
export type getArchiveResType = {
  archive: Archive
}
export async function getSingleArchive({ archiveId }: getArchiveParamsType): Promise<getArchiveResType> {
  return (await axios.get(`/api/archive/${archiveId}`)) as getArchiveResType
}

export type patchArchiveParamsType = {
  customerId: string
  archive: Archive
}
export type patchArchiveResType = {
  patchNum: number
}

export async function patchArchiveByCustomerId({
  customerId,
  archive,
}: patchArchiveParamsType): Promise<patchArchiveResType> {
  return await axios.patch(`/api/archive`, { customerId, archive })
}

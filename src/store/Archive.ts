import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { SubmittedArchive, Archive, FormArchive, initialArchives } from './types/Archive.types'

const ArchivesSlice = createSlice({
  name: 'archives',
  initialState: initialArchives,
  reducers: {
    //进入用户详情页后会请求所有已经提交过的档案
    resetArchives(_, action: PayloadAction<SubmittedArchive[]>) {
      return action.payload
    },
    //新增档案是用于预览，所以不用含有id的档案
    pathchArchives(archives: Archive[], action: PayloadAction<FormArchive>) {
      return [...archives, action.payload]
    },
    //档案不可修改和删除
    // updateArchive(
    //   archives: SubmittedArchive[],
    //   action: PayloadAction<Archive>,
    // ) {
    //   return archives.map((archive) =>
    //     archive.archiveId == action.payload.archiveId
    //       ? action.payload
    //       : archive,
    //   )
    // },
    // deleteArchive(archives: Archive[], action: PayloadAction<string>) {
    //   return archives.filter((archive) => archive.archiveId != action.payload)
    // },
  },
})

export const { resetArchives, pathchArchives } = ArchivesSlice.actions
export default ArchivesSlice.reducer

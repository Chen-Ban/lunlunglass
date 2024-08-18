import { useEffect } from 'react'
import { useRequest } from 'ahooks'
import { getSingleArchive } from '../services/archive'
type Props = {
  archiveId: string
}
export default function ({ archiveId }: Props) {
  const { run, loading } = useRequest(getSingleArchive, {
    manual: true,
    onSuccess() {},
  })
  useEffect(() => {
    run({ archiveId })
  })
  return {
    run,
    loading,
  }
}

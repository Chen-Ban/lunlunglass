import axiosInstance from './ajax'

export type StaticsResType = {
  customerCount: number
  optometryCount: number
  purchaseCount: number
}
export const getStaticsData = async (): Promise<StaticsResType> => {
  return await axiosInstance.get('/api/statics')
}

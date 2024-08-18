import axios, { AxiosInstance, isCancel } from 'axios'
import { message } from 'antd'
const instance: AxiosInstance = axios.create({
  timeout: 10 * 1000,
})

instance.interceptors.response.use(
  (res) => {
    const resData = (res.data || {}) as ResDataType
    const { errno, data, msg } = resData

    if (errno != 0) {
      return Promise.reject(new Error(msg || '网络出现了故障'))
    }
    return data
  },
  (error) => {
    if (isCancel(error)) {
      message.info('请求已取消')
    } else {
      message.error('请求发生错误: ' + error.message)
    }
  },
)
export default instance

export type ResType = {
  errno: number
  data?: ResDataType
  msg?: string
}

export type ResDataType = {
  [key: string]: any
}

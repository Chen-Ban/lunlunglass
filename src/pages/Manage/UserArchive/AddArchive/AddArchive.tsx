import { Form, Space, Input, Button, message } from 'antd'

import styles from './AddArchive.module.scss'
import Icon from '../../../../components/Icon/Icon'
import { Archive } from '../../../../store/types/Archive.types'
import { patchArchiveByCustomerId } from '../../../../services/archive'
const { Item, useForm } = Form
type Props = {
  customerId: string
}

type sigthFormType = {
  leftNearSighted: string
  leftAstigmation: string
  leftPupilDistance: string
  rightNearSighted: string
  rightAstigmation: string
  rightPupilDistance: string
}
type prescriptionFormType = {
  leftAdjustSight: string
  leftAxial: string
  leftSpherical: string
  leftCylinder: string
  rightAdjustSight: string
  rightAxial: string
  rightSpherical: string
  rightCylinder: string
}
const sigthFormInitailValues: sigthFormType = {
  leftNearSighted: '',
  leftAstigmation: '',
  leftPupilDistance: '',
  rightNearSighted: '',
  rightAstigmation: '',
  rightPupilDistance: '',
}
const prescriptionFormInitailValues: prescriptionFormType = {
  leftAdjustSight: '',
  leftAxial: '',
  leftSpherical: '',
  leftCylinder: '',

  rightAdjustSight: '',
  rightAxial: '',
  rightSpherical: '',
  rightCylinder: '',
}

export default function AddArchive({ customerId }: Props) {
  const [sigthForm] = useForm()
  const [prescriptionForm] = useForm()
  const onSave = async () => {
    try {
      await sigthForm.validateFields()
      await prescriptionForm.validateFields()
      //获取数据
      const sightInfo: sigthFormType = sigthForm.getFieldsValue()
      const prescriptionInfo: prescriptionFormType = prescriptionForm.getFieldsValue()
      //组装数据
      const archive: Archive = {
        timeStamp: new Date().getTime(),
        sight: {
          left: {
            nearsighted: parseInt(sightInfo.leftNearSighted),
            pupilDistance: parseInt(sightInfo.leftPupilDistance),
            astigmatism: parseInt(sightInfo.leftAstigmation),
          },
          right: {
            nearsighted: parseInt(sightInfo.rightNearSighted),
            pupilDistance: parseInt(sightInfo.rightPupilDistance),
            astigmatism: parseInt(sightInfo.rightAstigmation),
          },
        },
        prescription: {
          left: {
            spherical: parseInt(prescriptionInfo.leftSpherical),
            axial: parseInt(prescriptionInfo.leftAxial),
            adjustSight: parseInt(prescriptionInfo.leftAdjustSight),
            cylinder: parseInt(prescriptionInfo.leftCylinder),
          },
          right: {
            spherical: parseInt(prescriptionInfo.rightSpherical),
            axial: parseInt(prescriptionInfo.rightAxial),
            adjustSight: parseInt(prescriptionInfo.rightAdjustSight),
            cylinder: parseInt(prescriptionInfo.rightCylinder),
          },
        },
      }
      //发送请求

      const { patchNum } = await patchArchiveByCustomerId({
        customerId,
        archive,
      })
      if (patchNum == 1) {
        message.success('创建客户档案成功')
        //清空表单
        sigthForm.resetFields()
        prescriptionForm.resetFields()
      } else {
        throw new Error('新建客户档案失败')
      }
    } catch (error) {
      // console.log(error)
    }
  }
  return (
    <div className={styles.container}>
      <div className={styles.infoWrapper}>
        <div className={styles.formWrapper}>
          <div className={styles.title}>视力信息</div>
          <Form
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            form={sigthForm}
            initialValues={sigthFormInitailValues}
            layout="inline"
          >
            <Space direction="vertical" size={30}>
              <Space>
                <Item
                  label="视力"
                  name="leftNearSighted"
                  validateTrigger="onBlur"
                  rules={[
                    () => ({
                      validator(_, value) {
                        if (value >= 0 && value <= 1500) {
                          return Promise.resolve()
                        } else {
                          return Promise.reject(new Error('请输入正确的数据:(0-1500)'))
                        }
                      },
                      message: '请输入正确的数据:(0-1500)',
                    }),
                  ]}
                >
                  <Input placeholder="左眼视力" addonBefore={<Icon type="zuoyan"></Icon>}></Input>
                </Item>

                <Item
                  name="rightNearSighted"
                  validateTrigger="onBlur"
                  rules={[
                    () => ({
                      validator(_, value) {
                        if (value >= 0 && value <= 1500) {
                          return Promise.resolve()
                        } else {
                          return Promise.reject(new Error('请输入正确的数据:(0-1500)'))
                        }
                      },
                      message: '请输入正确的数据:(0-1500)',
                    }),
                  ]}
                >
                  <Input placeholder="右眼视力" addonBefore={<Icon type="youyan"></Icon>}></Input>
                </Item>
              </Space>

              <Space>
                <Item
                  label="瞳距"
                  name="leftPupilDistance"
                  validateTrigger="onBlur"
                  rules={[
                    () => ({
                      validator(_, value) {
                        if (value >= 0 && value <= 1500) {
                          return Promise.resolve()
                        } else {
                          return Promise.reject(new Error('请输入正确的数据:(0-1500)'))
                        }
                      },
                      message: '请输入正确的数据:(0-1500)',
                    }),
                  ]}
                >
                  <Input placeholder="左眼瞳距" addonBefore={<Icon type="distance"></Icon>}></Input>
                </Item>
                <Item
                  name="rightPupilDistance"
                  validateTrigger="onBlur"
                  rules={[
                    () => ({
                      validator(_, value) {
                        if (value >= 0 && value <= 1500) {
                          return Promise.resolve()
                        } else {
                          return Promise.reject(new Error('请输入正确的数据:(0-1500)'))
                        }
                      },
                      message: '请输入正确的数据:(0-1500)',
                    }),
                  ]}
                >
                  <Input placeholder="右眼瞳距" addonBefore={<Icon type="distance"></Icon>}></Input>
                </Item>
              </Space>

              <Space>
                <Item
                  label="散光"
                  name="leftAstigmatism"
                  validateTrigger="onBlur"
                  rules={[
                    () => ({
                      validator(_, value) {
                        if (value >= 0 && value <= 1500) {
                          return Promise.resolve()
                        } else {
                          return Promise.reject(new Error('请输入正确的数据:(0-1500)'))
                        }
                      },
                      message: '请输入正确的数据:(0-1500)',
                    }),
                  ]}
                >
                  <Input placeholder="左眼散光" addonBefore={<Icon type="diffuse"></Icon>}></Input>
                </Item>
                <Item
                  name="rightAstigmatism"
                  validateTrigger="onBlur"
                  rules={[
                    () => ({
                      validator(_, value) {
                        if (value >= 0 && value <= 1500) {
                          return Promise.resolve()
                        } else {
                          return Promise.reject(new Error('请输入正确的数据:(0-1500)'))
                        }
                      },
                      message: '请输入正确的数据:(0-1500)',
                    }),
                  ]}
                >
                  <Input placeholder="左眼散光" addonBefore={<Icon type="diffuse"></Icon>}></Input>
                </Item>
              </Space>
            </Space>
          </Form>
        </div>
      </div>
      <div className={styles.infoWrapper}>
        <div className={styles.formWrapper}>
          <div className={styles.title}>配镜信息</div>
          <Form
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            form={prescriptionForm}
            initialValues={prescriptionFormInitailValues}
          >
            <Space direction="vertical" size={30}>
              <Space>
                <Item
                  label="球镜"
                  name="leftSpherical"
                  validateTrigger="onBlur"
                  rules={[
                    () => ({
                      validator(_, value) {
                        if (value >= 0 && value <= 1500) {
                          return Promise.resolve()
                        } else {
                          return Promise.reject(new Error('请输入正确的数据:(0-1500)'))
                        }
                      },
                      message: '请输入正确的数据:(0-1500)',
                    }),
                  ]}
                >
                  <Input placeholder="左眼球镜" addonBefore={<Icon type="zuoyan"></Icon>}></Input>
                </Item>

                <Item
                  name="rightSpherical"
                  validateTrigger="onBlur"
                  rules={[
                    () => ({
                      validator(_, value) {
                        if (value >= 0 && value <= 1500) {
                          return Promise.resolve()
                        } else {
                          return Promise.reject(new Error('请输入正确的数据:(0-1500)'))
                        }
                      },
                      message: '请输入正确的数据:(0-1500)',
                    }),
                  ]}
                >
                  <Input placeholder="右眼球镜" addonBefore={<Icon type="youyan"></Icon>}></Input>
                </Item>
              </Space>

              <Space>
                <Item
                  label="矫正视力"
                  name="leftAdjustSight"
                  validateTrigger="onBlur"
                  rules={[
                    () => ({
                      validator(_, value) {
                        if (value >= 0 && value <= 1500) {
                          return Promise.resolve()
                        } else {
                          return Promise.reject(new Error('请输入正确的数据:(0-1500)'))
                        }
                      },
                      message: '请输入正确的数据:(0-1500)',
                    }),
                  ]}
                >
                  <Input placeholder="左眼矫正视力" addonBefore={<Icon type="zuoyan"></Icon>}></Input>
                </Item>

                <Item
                  name="rightAdjustSight"
                  validateTrigger="onBlur"
                  rules={[
                    () => ({
                      validator(_, value) {
                        if (value >= 0 && value <= 1500) {
                          return Promise.resolve()
                        } else {
                          return Promise.reject(new Error('请输入正确的数据:(0-1500)'))
                        }
                      },
                      message: '请输入正确的数据:(0-1500)',
                    }),
                  ]}
                >
                  <Input placeholder="右眼矫正视力" addonBefore={<Icon type="youyan"></Icon>}></Input>
                </Item>
              </Space>

              <Space>
                <Item
                  label="柱镜"
                  name="leftCylinder"
                  validateTrigger="onBlur"
                  rules={[
                    () => ({
                      validator(_, value) {
                        if (value >= 0 && value <= 1500) {
                          return Promise.resolve()
                        } else {
                          return Promise.reject(new Error('请输入正确的数据:(0-1500)'))
                        }
                      },
                      message: '请输入正确的数据:(0-1500)',
                    }),
                  ]}
                >
                  <Input placeholder="左眼柱镜" addonBefore={<Icon type="zuoyan"></Icon>}></Input>
                </Item>

                <Item
                  name="rightCylinder"
                  validateTrigger="onBlur"
                  rules={[
                    () => ({
                      validator(_, value) {
                        if (value >= 0 && value <= 1500) {
                          return Promise.resolve()
                        } else {
                          return Promise.reject(new Error('请输入正确的数据:(0-1500)'))
                        }
                      },
                      message: '请输入正确的数据:(0-1500)',
                    }),
                  ]}
                >
                  <Input placeholder="右眼柱镜" addonBefore={<Icon type="youyan"></Icon>}></Input>
                </Item>
              </Space>

              <Space>
                <Item
                  label="轴向"
                  name="leftAxial"
                  validateTrigger="onBlur"
                  rules={[
                    () => ({
                      validator(_, value) {
                        if (value >= 0 && value <= 1500) {
                          return Promise.resolve()
                        } else {
                          return Promise.reject(new Error('请输入正确的数据:(0-1500)'))
                        }
                      },
                      message: '请输入正确的数据:(0-1500)',
                    }),
                  ]}
                >
                  <Input placeholder="左眼轴向" addonBefore={<Icon type="zuoyan"></Icon>}></Input>
                </Item>

                <Item
                  name="rightAxial"
                  validateTrigger="onBlur"
                  rules={[
                    () => ({
                      validator(_, value) {
                        if (value >= 0 && value <= 1500) {
                          return Promise.resolve()
                        } else {
                          return Promise.reject(new Error('请输入正确的数据:(0-1500)'))
                        }
                      },
                      message: '请输入正确的数据:(0-1500)',
                    }),
                  ]}
                >
                  <Input placeholder="右眼轴向" addonBefore={<Icon type="youyan"></Icon>}></Input>
                </Item>
              </Space>
            </Space>
          </Form>
        </div>
        <Space direction="horizontal" style={{ marginTop: '20px' }} size={20}>
          <Button onClick={onSave}>保存</Button>
          <Button>打印</Button>
        </Space>
      </div>
    </div>
  )
}

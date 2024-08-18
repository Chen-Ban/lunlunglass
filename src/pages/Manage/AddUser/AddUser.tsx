import { useTitle } from 'ahooks'
import { Form, Input, Space, Button, Switch, Radio, Modal, Spin, message } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import styles from './AddUser.module.scss'
import { Customer, Gender, SubmittedCustomer } from '../../../store/types/Customer.types'
import Icon from '../../../components/Icon/Icon'
import { pathchCustomer, pathchCustomerSource } from '../../../services/customer'
import { usePathchCustomers } from '../../../hooks/useCustomersData'
import { MANAGE } from '../../../router'

const { Item } = Form

type basicFormType = Omit<
  Customer,
  | 'lastArchive'
  | 'archives'
  | 'imgSrc'
  | 'customerId'
  | 'isDelete'
  | 'optometry'
  | 'purchase'
  | 'optometry'
  | 'optometry'
>
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
export default function AddUser() {
  useTitle('新增用户')
  const nav = useNavigate()
  const basicFormInitailValues: Partial<basicFormType> = {
    gender: Gender.Male,
    isImportant: false,
  }

  const [basicForm] = useForm()
  const [sigthForm] = useForm()
  const [prescriptionForm] = useForm()

  const patchCustomer = usePathchCustomers()

  const onSave = async () => {
    try {
      await basicForm.validateFields()
      await sigthForm.validateFields()

      await prescriptionForm.validateFields()
      setOpen(true)
      //获取数据
      const basicInfo: basicFormType = basicForm.getFieldsValue()
      const sightInfo: sigthFormType = sigthForm.getFieldsValue()
      const prescriptionInfo: prescriptionFormType = prescriptionForm.getFieldsValue()
      //组装数据
      const customer: Customer = {
        ...basicInfo,
        lastArchive: {
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
        },
        isDelete: false,
        archives: [],
        purchase: 0,
        optometry: 1,
        imgSrc: 'sdf',
      }
      //发送请求

      const { patchNum, customer: newCustomer } = await pathchCustomer(customer)
      if (patchNum == 1) {
        message.success('创建客户档案成功')
        //清空表单
        basicForm.resetFields()
        sigthForm.resetFields()
        prescriptionForm.resetFields()
        //关闭modal
        setOpen(false)
        patchCustomer([newCustomer])
        //返回上级
        nav(MANAGE + '/' + (newCustomer as SubmittedCustomer).customerId)
      } else {
        throw new Error('新建客户档案失败')
      }
    } catch (error) {
      // console.log(error)
    }
  }
  const [open, setOpen] = useState<boolean>(false)
  const onCancel = () => {
    pathchCustomerSource.cancel()
    setOpen(false)
  }
  return (
    <div className={styles.container}>
      <Modal
        open={open}
        footer={[
          <Button key="cancel" type="primary" onClick={onCancel}>
            取消
          </Button>,
        ]}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <div style={{ marginBottom: '20px', fontSize: '16px' }}>正在保存...</div>
          <Spin></Spin>
        </div>
      </Modal>
      <div className={styles.infoWrapper}>
        <div className={styles.formWrapper}>
          <div className={styles.title}>基础信息</div>
          <Form
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            form={basicForm}
            initialValues={basicFormInitailValues}
          >
            <Item
              label="姓名:"
              name="name"
              rules={[
                { required: true, message: '请输入姓名' },
                {
                  min: 2,
                  max: 28,
                  message: '请输入正确的姓名:2-28个字符',
                },
              ]}
            >
              <Input placeholder="姓名" addonBefore={<Icon type="nickname"></Icon>}></Input>
            </Item>
            <Item
              label="年龄:"
              name="age"
              validateTrigger="onBlur"
              rules={[
                { required: true, message: '请输入年龄' },
                () => ({
                  validator(_, value) {
                    if (value >= 3 && value <= 150) {
                      return Promise.resolve()
                    } else {
                      return Promise.reject(new Error('请输入正确的年龄:(3-150)'))
                    }
                  },
                  message: '请输入正确的年龄:(3-150)',
                }),
              ]}
            >
              <Input placeholder="年龄(1-150)" addonBefore={<Icon type="age"></Icon>}></Input>
            </Item>

            <Item label="性别:" name="gender" rules={[{ required: true }]}>
              <Radio.Group>
                <Space>
                  <Radio value={Gender.Male}>男</Radio>
                  <Radio value={Gender.Female}>女</Radio>
                  <Radio value={Gender.Unknown}>未知</Radio>
                </Space>
              </Radio.Group>
            </Item>

            <Item
              label="手机:"
              name="phone"
              validateTrigger="onBlur"
              rules={[
                {
                  required: true,
                  message: '请输入手机号',
                },
                {
                  pattern: /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/,
                  message: '请输入正确手机号',
                },
              ]}
            >
              <Input name="phone" placeholder="手机" addonBefore={<Icon type="phone"></Icon>}></Input>
            </Item>
            <Item label="重要客户:" name="isImportant">
              <Switch checkedChildren="重要" unCheckedChildren="普通"></Switch>
            </Item>
          </Form>
        </div>
      </div>
      <div className={styles.infoWrapper}>
        <div className={styles.formWrapper}>
          <div className={styles.title}>视力信息</div>
          <Form labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} form={sigthForm} layout="inline">
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
          <Form labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} form={prescriptionForm}>
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

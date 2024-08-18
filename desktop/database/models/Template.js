const { Schema, model } = require('mongoose')
const { SightSchema, PrescriptionSchema } = require('./Archive')
const CanvasNodeSchema = new Schema({
  componentId: {
    type: String,
    require: true,
  },
  instanceId: {
    type: String,
    require: true,
    unique: true,
  },
  location: {
    type: {
      x: Number,
      y: Number,
    },
    require: true,
  },
  path: {
    type: [{ x: Number, y: Number }],
    require: true,
  },
  size: {
    type: {
      width: Number,
      height: Number,
    },
    require: true,
  },
  layer: {
    type: Number,
    require: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    require: true,
    enum: ['text', 'picture', 'polygon', 'table'],
  },
  //mongoose无法类型联合并枚举不同的schema，无法使用嵌入文档
  //鉴别器主要用于在基础model上添加不同的字段
  //不为每个节点创建数据，所以不适用引用
  //以Object代替
  options: {
    type: Object,
    require: true,
  },
  propName: {
    type: String,
  },
})
const Comodity = new Schema({
  CommodityId: {
    type: String,
    require: true,
    unique: true,
  },
  name: {
    type: String,
    require: true,
  },
  num: {
    type: Number,
    require: true,
  },
  unitPrice: {
    type: Number,
    require: true,
  },
})
const TemplateDataSchema = new Schema({
  title: {
    type: String,
    require: true,
  },
  printId: {
    type: String,
    require: true,
  },
  timeStamp: {
    type: Number,
    require: true,
  },
  outlets: {
    type: String,
    require: true,
  },
  saleman: {
    type: String,
    require: true,
  },
  customerName: {
    type: String,
    require: true,
  },
  customerPhone: {
    type: String,
    require: true,
  },
  remark: {
    type: String,
    require: true,
  },
  phone: {
    type: String,
    require: true,
  },
  address: {
    type: String,
    require: true,
  },
  QRCodeURL: {
    type: String,
    require: true,
  },
  sight: {
    type: SightSchema,
    require: true,
  },

  prescription: {
    type: PrescriptionSchema,
  },
  commoditys: {
    type: [Comodity],
  },
  totalPrice: {
    type: Number,
  },
})
const TemplateSchema = new Schema({
  templateId: {
    type: String,
    require: true,
    unique: true,
  },
  templateType: {
    type: String,
    require: true,
  },
  nodeList: {
    type: [CanvasNodeSchema],
    require: true,
  },
  templateData: {
    type: TemplateDataSchema,
    require: true,
  },
})

module.exports = new model('Template', TemplateSchema)

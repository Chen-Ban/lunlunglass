const mongoose = require('mongoose')
const { Schema } = mongoose

const SightDataSchema = new Schema({
  nearsighted: Number, //近视程度
  astigmatism: Number, //散光
  pupilDistance: Number, //瞳距
})

const SightSchema = new Schema({
  left: SightDataSchema,
  right: SightDataSchema,
})

const PrescriptionDataSchema = new Schema({
  spherical: Number, //球镜
  adjustSight: Number, //矫正视力
  cylinder: Number, //柱镜
  axial: Number, //轴向
})

const PrescriptionSchema = new Schema({
  left: PrescriptionDataSchema,
  right: PrescriptionDataSchema,
})

const ArchiveSchema = new Schema({
  customerId: String,
  archiveId: String,
  sight: SightSchema, //视力
  prescription: PrescriptionSchema, //配镜处方
  timeStamp: Number, //档案建立时间
})

module.exports = {
  ArchiveSchema,
  SightSchema,
  PrescriptionSchema,
  ArchiveModel: mongoose.model('Archive', ArchiveSchema),
}

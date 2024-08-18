const mongoose = require('mongoose')
const { Schema } = mongoose
const { ArchiveSchema } = require('./Archive')
const CustomerSchema = new Schema({
  customerId: {
    type: String,
    require: true,
    unique: true,
  },
  name: {
    type: String,
    minLength: 2,
    maxLength: 28,
    require: true,
    validate: {
      validator(name) {
        return /^([\u4e00-\u9fa5\s]+|[A-Za-z\s'-]+|\d+)$/.test(name)
      },
      message: '{VALUE} is not a valid name',
    },
  },
  age: {
    type: Number,
    min: 3,
    max: 150,
  },
  imgSrc: {
    type: String,
    require: true,
  },
  gender: {
    type: Number,
    validate: {
      validator: function (v) {
        return [1, 0, -1].includes(v)
      },
      message: 'Role `{VALUE}` is not a valid enum value.',
    },
    default: 0,
  },
  isImportant: {
    type: Boolean,
    default: false,
  },
  isDelete: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    validate: {
      validator(phone) {
        return /^(?:(?:\+|00)86)?1[3-9]\d{9}$/.test(phone)
      },
      message: '{VALUE} is not a valid phone number',
    },
    require: true,
  },
  optometry: {
    type: Number,
    min: 1,
  }, //验光次数
  purchase: {
    type: Number,
    min: 0,
  }, //购买次数
  lastArchive: ArchiveSchema, //最近一次验光档案
  archives: {
    type: [String],
    required: true,
  }, //档案_id列表
})

CustomerSchema.pre('save', async function (next) {
  try {
    const lastArchiveId = this.lastArchive?.archiveId
    const firstArchive = this.archives?.[0]
    if (
      lastArchiveId &&
      firstArchive &&
      firstArchive !== lastArchiveId.toString()
    ) {
      throw new mongoose.Error.ValidationError(this, 'archives', {
        message:
          'The first element of "archives" must be the same as "lastArchive.archiveId".',
        value: firstArchive,
        path: 'archives',
        kind: 'required',
        reason: 'value does not match',
      })
    }
    next()
  } catch (error) {
    next(error)
  }
})

module.exports = mongoose.model('Customer', CustomerSchema)

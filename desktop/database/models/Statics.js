const { Schema, model } = require('mongoose')

const Statics = new Schema({
  customerCount: Number,
  optometryCount: Number,
  purchaseCount: Number,
  printCount: Number,
})

module.exports = model('statics', Statics)

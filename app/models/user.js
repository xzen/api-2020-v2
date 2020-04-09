const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  gender: String,
  age: Number,
  adressNumber: Number,
  adressType: String,
  adressName: String,
  cityCode: String,
  cityName: String
}, {
  collection: 'users',
  minimize: false,
  versionKey: false
}).set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id

    delete ret._id
  }
})

module.exports = Schema

var mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
  name: {type: String, default: 'an awesome task'},
  done: {type: Boolean, default: false},
  due: {type: Date}
})

let Task = mongoose.model('Task', taskSchema)

module.exports = Task

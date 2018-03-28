const mongoose = require('mongoose')
let Task = require('./models/task')

mongoose.connect('mongodb://binhsonnguyen.com:8000/today')

Task.collection.drop()

new Task({
  name: 'viet demo mongoose',
  done: false,
  due: new Date(2018, 2, 19, 17, 0, 0)
}).save()

new Task({
  name: 'viet script seed database',
  done: false,
  due: new Date(2018, 2, 19, 21, 0, 0)
}).save()


let express = require('express')

let app = new express()

app.use(express.static(__dirname+'/public'))

app.set('view engine','ejs')

app.get('/',function (req,res) {
  let view = 'MainPage'
  let tasks = getTasksFromDatabase()
  let params = {
    tasks: tasks
  }
  res.status(200).render(view, params)
})

app.listen(8000, function () {
  console.log('Server running at http://localhost:8000')
})

let Task = function(name) {
  let _name = name

  this.getName = function () {
    return _name
  }

  this.setName = function (name) {
    _name = name
  }
}

function getTasksFromDatabase () {
  let task01 = new Task("do 5 homework")
  let task03 = new Task("implement feature #5")

  task01.getName()
  task01.setName("fix issue #6")

  return [task01, task03]
}


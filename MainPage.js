let express = require('express')

let app = new express()
app.use(express.static(__dirname+'/public'))
app.set('view engine','ejs')
app.get('/',function (req,res) {
  let view = 'MainPage'
  let params = {}
  res.status(200).render(view, params)
})

app.listen(8000, function () {
  console.log('Listening at port 8000')
})
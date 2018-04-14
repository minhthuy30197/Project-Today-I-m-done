function initialize () {
  $.get('/gettask', (data) => {
    let arr = JSON.parse(data)
    let count = arr.tasks.length
    let i = 0
    while (i < count) {
      if (arr.tasks[i].done == true) $('#task-list').
        append(drawDoneTask(arr.tasks[i].id, arr.tasks[i].name))
      else $('#task-list').
        append(drawNotDoneTask(arr.tasks[i].id, arr.tasks[i].name))
      i++
    }
  })
  $.get('/getpomo', (data) => {
    let pomo = JSON.parse(data)
    console.log(pomo)
    $('#breakTime').text(pomo.breakTime)
    $('#totTime').text(pomo.totTime)
    if (pomo.isBreak == 'false') $('#break-text').css({'visibility': 'hidden'})
    else $('#break-text').css({'visibility': 'visible'})
    if (isEditTable()) $('.settings').css({'color': 'black'})
    else $('.settings').css({'color': 'lightgrey'})
    if (pomo.isPause == true) {
      if (pomo.isBreak == 'false') continueStop(timer, pomo.elapsedtime,
        pomo.totTime)
      else continueStop(timer, pomo.elapsedtime, pomo.breakTime)
      $('#startstop').text('Start').addClass('btn-primary')
    }
    else {
      let now = new Date()
      let lefttime = parseInt(pomo.elapsedtime)
      let tot = parseInt(pomo.totTime) * 60 * 1000
      let bre = parseInt(pomo.breakTime) * 60 * 1000
      let time = now - parseInt(pomo.nowTime)
      let status = pomo.isBreak
      lefttime += time
      while (lefttime > 0) {
        if (status == 'false') {
          if (lefttime > tot) {
            lefttime -= tot
            status = 'true'
          }
          else break
        }
        else {
          if (lefttime > bre) {
            lefttime -= bre
            status = 'false'
          }
          else break
        }
      }
      console.log(status + '  ' + lefttime)
      continueTimer(timer, lefttime, status)
      $('#startstop').text('Pause').addClass('btn-warning')
    }
  })
  $.get('/getslogan', (data) => {
    $('#slogan').attr('placeholder', data['title']).blur()
  })
}

function showInfo (id) {
  $.get('/task?id=' + id, (data) => {
    let obj = JSON.parse(data)
    $('#task_modal_name').val(obj.name)
    $('#task_id').val(obj.id)
    $('#myModal').modal()
  })
}

function deleteTask () {
  id = $('#task_id').val()
  let obj = {'id': id}
  $.ajax({
    type: 'POST',
    url: '/delete',
    data: obj,
    dataType: 'json',
    success: function (result) {
      if (result['result'] === 'success') {
        $('#myModal').modal('hide')
        $('#' + id).remove()
      }
    },
  })
}

function doneTask (id) {
  let obj = {'id': id}
  $.ajax({
    type: 'POST',
    url: '/done',
    data: obj,
    dataType: 'json',
    success: function (result) {
      if (result['result'] === 'success') {
        $('#' + id).replaceWith(drawDoneTask(id, result['name']))
      }
    },
  })
}

function resetTask (id) {
  let obj = {'id': id}
  $.ajax({
    type: 'POST',
    url: '/reset',
    data: obj,
    dataType: 'json',
    success: function (result) {
      if (result['result'] === 'success') {
        $('#' + id).replaceWith(drawNotDoneTask(id, result['name']))
      }
    },
  })
}

function addTask () {
  let name = $('#newtask').val()
  if (name === '') alert('Please do not leave the content of task blank!')
  else {
    let obj = {'name': name}
    $.ajax({
      type: 'POST',
      url: '/insert',
      data: obj,
      dataType: 'json',
      success: function (result) {
        if (result['result'] === 'success') {
          console.log(result['id'])
          $('#newtask').val('')
          $('#task-list').append(drawNotDoneTask(result['id'], name))
        }
      },
    })
  }
}

function addSlogan (event) {
  let title = $('#slogan').val()
  if (title != '') {
    let obj = {'title': title}
    $.ajax({
      type: 'POST',
      url: '/setslogan',
      data: obj,
      dataType: 'json',
      success: function (result) {
        if (result['result'] === 'success') {
          $('#slogan-input').attr('placeholder', title).blur()
        }
      },
    })
  }
}

function saveTask (event) {
  let name = $('#task_modal_name').val()
  let id = $('#task_id').val()
  if (name === '') alert('Please do not leave the content of task blank!')
  else {
    let obj = {'name': name, 'id': id}
    $.ajax({
      type: 'POST',
      url: '/changetask',
      data: obj,
      dataType: 'json',
      success: function (result) {
        if (result['result'] === 'success') {
          $('#content' + id).text(name)
          $('#myModal').modal('hide')
        }
      },
    })
  }
}

function drawDoneTask (id, name) {
  return '<li class="list-group-item borderless" id=\'' + id + '\'>\n' +
    '       <input name="checkdone" checked type="checkbox" value="" class="largerCheckbox col-xs-3" onclick="resetTask(\'' +
    id + '\')">\n' +
    '         <div class="contenttask" onclick="showInfo(\'' + id + '\')">\n' +
    '           <p class="donecontent" id=\'content' + id + '\'>' + name +
    '</p>' +
    '         </div>\n' +
    '     </li>'
}

function drawNotDoneTask (id, name) {
  return '<li class="list-group-item borderless" id=\'' + id + '\'>\n' +
    '       <input name="checkdone" type="checkbox" value="" class="largerCheckbox" onclick="doneTask(\'' +
    id + '\')">\n' +
    '         <div class="contenttask" onclick="showInfo(\'' +
    id + '\')">\n' +
    '           <p id=\'content' + id + '\'>' + name + '</p>' +
    '         </div>\n' +
    '     </li>'
}
exports.Task = function() {
  let _name = name;

  this.getName = function () {
    return _name;
  }

  this.setName = function (name) {
    _name = name;
  }
};
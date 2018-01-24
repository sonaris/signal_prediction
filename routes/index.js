var express = require('express');
var router = express.Router();

var globalUser = {
  username: 'david.overfeld@gmx.de',
  password: 'test'
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {

  // render the page and pass in any flash data if it exists
  res.render('user/login', {Status: "" }); 
});

router.post('/loginEvaluation', function(req, res, next) {

  var username = req.body.username;
  var password = req.body.password;

  console.log('username: ', req.body.username);
  console.log('password: ', req.body.password);

  var evaluation = false;

  if (username == globalUser.username && password == globalUser.password){
    res.redirect('/');
  }
  else {
    res.render('user/login', {Status: "Wrong username or password!" }); 
  }

  console.log(globalUser);
  // render the page and pass in any flash data if it exists
  
});

router.get('/logout', function(req, res, next) {

  res.redirect('/');
});

module.exports = router;

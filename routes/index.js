var express = require('express');
var router = express.Router();

var globalUser = {
  username: 'david.overfeld@gmx.de',
  password: 'test'
}

var loggedIn  = false;

function checkSignIn (req, res, next){
  if(req.session.user){
     next();     //If session exists, proceed to page
  } else {
     res.render('message', { message: 'Not signed in!'});
     next(); 
  }
}

/* GET home page. */
router.get('/', checkSignIn, function(req, res, next) {
  res.render('index', { title: 'Express', user: req.session.user});
});

router.get('/login', function(req, res, next) {
  console.log(req.session.user);
  res.render('user/login', {user: req.session.user}); 
});

router.post('/login', function(req, res, next) {
  console.log(req.body);
  var currentUser = {id: req.body.username, password: req.body.password};

  if (req.body.username == globalUser.username && req.body.password == globalUser.password){
      req.session.user = currentUser;
      loggedIn = true;
      res.redirect('/');
  }
  else {
    req.session.destroy(function(err) {
      if(err) {
        res.render('user/login', {Status: "Wrong username or password!" }); 
      } else {
        res.render('user/login', {Status: "Wrong username or password!" }); 
      }
    });
    
  }

  //console.log(globalUser);
  // render the page and pass in any flash data if it exists
  
});

router.get('/logout', function(req, res, next) {

  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return res.redirect('/');
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;

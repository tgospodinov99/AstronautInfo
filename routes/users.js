var express = require('express');
var router = express.Router();
const db = require("../database/sequelize");
const bcrypt = require('bcryptjs');
const session = require('express-session');
const user = db.users;
const isAuth = require('../auth/userauth');

/* GET users listing. */

/*const isAuth = (req, res, next) => {
  if(req.session.isAuth){
    next();
  } else {
    res.redirect('/users/login');
  }
}*/

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/create', function(req, res, next) {
  res.render('create');
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/dashboard', isAuth, function(req, res, next) {
  const username = req.body.username;
  res.render('dashboard', {username: username});
});

router.post('/create', async function(req, res, next) {
  if (!req.body.username) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }
  const {username, email, password} = req.body;
  userExist = await user.findOne({where: {email}});
  console.log(userExist);
  //await db.users.findOne({email});

  if(userExist){
    return res.redirect('/users/create')
  }

  const hashPassword = await bcrypt.hash(password, 12);

  // Create a user
  const User = {
    username,
    email,
    password: hashPassword,
    registrationdate: new Date().toLocaleString()
  };

  // Save user in the database
  user.create(User)
    .then(data => {
      //res.send(data);
      res.redirect('/users/login');
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the User."
      });
    });
  //res.redirect('/users/create');
});

router.post('/login', async (req, res, next) => {
  const {email, password} = req.body;
  const userExist = await user.findOne({where: {email}});

  if(!userExist){
    return res.redirect('/users/login');
  }

  const isMatch = await bcrypt.compare(password, userExist.password);

  if(!isMatch){
    return res.redirect('/users/login');
  }

  req.session.isAuth = true;
  res.redirect('/users/dashboard');
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if(err) throw err;
    res.redirect('/');
  });
});


module.exports = router;

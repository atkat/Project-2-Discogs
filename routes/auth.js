const router = require("express").Router();
const User = require('../models/User.model');
const Record = require('../models/Record.model');
const bcrypt = require('bcrypt');

router.get('/signup', (req, res, next) => {
  res.render('auth/signup');
})

router.post('/signup', (req, res, next) => {
  const {
    username,
    password,
    aboutMe
  } = req.body;
  if (password.length < 8) {
    res.render('auth/signup', {
      message: 'Your password must contain at least 8 characters',
    });
    return
  }
  if (username === '') {
    res.render('auth/signup', {
      message: 'Your username cannot be empty',
    });
    return
  }
  User.findOne({
      username: username,
      aboutMe: aboutMe
    })
    .then(userFromDB => {
      if (userFromDB !== null) {
        res.render('auth/signup', {
          message: 'This username is already taken',
        });
      } else {
        const salt = bcrypt.genSaltSync();
        const hash = bcrypt.hashSync(password, salt);
        console.log(hash);
        User.create({
            username: username,
            password: hash,
            aboutMe: aboutMe
          })
          .then(createdUser => {
            res.redirect('login');
          })
      }
    })
})

router.get('/login', (req, res, next) => {
  res.render('auth/login', {
    user: req.session.user
  });
})

router.post('/login', (req, res, next) => {
  const {
    username,
    password
  } = req.body;
  User.findOne({
      username: username
    })
    .then(userFromDB => {
      if (userFromDB === null) {
        res.render('auth/login', {
          message: 'Invalid credentials',
          user: req.session.user
        });
        return;
      }
      if (bcrypt.compareSync(password, userFromDB.password)) {
        req.session.user = userFromDB;
        res.redirect('/profile');
      } else {
        res.render('auth/login', {
          message: 'Invalid credentials',
          user: req.session.user
        });
      }
    })
})

router.get('/logout', (req, res, next) => {
  req.session.destroy(error => {
    if (error) {
      next(error);
    } else {
      res.redirect('/');
    }
  })
});


module.exports = router;
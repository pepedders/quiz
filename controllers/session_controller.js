var models = require('../models');
var Sequelize = require('sequelize');
var url = require('url');

exports.loginRequired = function(req, res, next){
  if(req.session.user){
    next();
  } else {
    res.redirect('/session?redir=' + (req.param('redir') || req.url));
  }
};


// GET /session -- Formulario de login
exports.new = function(req, res, next){
  var redir = req.query.redir || url.parse(req.headers.referer || "/").pathname;
  if (redir === '/session' || redir === '/users/new'){ redir = '/'; }
  res.render('session/new', { redir: redir });
};


// POST /session -- Crear sesion
exports.create = function(req, res, next){
  var redir = req.body.redir || '/';
  var login = req.body.login;
  var password = req.body.password;

  authenticate(login, password).then(function(user){
    if(user){
      //Crear req.session.user y guardar campos id y username
      //La sesion se define por la existencia de: req.session.user
      req.session.user = { id: user.id, username: user.username, isAdmin: user.isAdmin };
      res.redirect(redir); // redirección a redir
    } else {
      req.flash('error', 'La autenticación ha fallado. Reinténtelo otra vez.');
      res.redirect('/session?redir=' + redir);
    }
  }).catch(function(error){
    req.flash('error', 'Se ha producido un error: '+error);
    next(error);
  });
};


// adminAndNotMyselfRequired
exports.adminAndNotMyselfRequired = function(re, res, next){
  var isAdmin = req.session.user.isAdmin;
  var quizAuthorId = req.user.id;
  var loggedUserId = req.session.user.id;

  if(isAdmin || userId !== loggedUserId){
    next();
  } else {
    console.log('Ruta prohibida: No es el usuario logueado ni un administrador.');
    res.send(403);
  }
};


// adminOrMyselfRequired
exports.adminOrMyselfRequired = function(req, res, next){
  var isAdmin = req.session.user.isAdmin;
  var quizAuthorId = req.user.id;
  var loggedUserId = req.session.user.id;

  if(isAdmin || userId === loggedUserId){
    next();
  } else {
    console.log('Ruta prohibida: No es el usuario logueado ni un administrador.');
    res.send(403);
  }
};


// DELETE /session -- Destruir sesion
exports.destroy = function(req, res, next){
  delete req.session.user; //Logout borra propiedad user en req.session
  res.redirect('/session'); //redirect a login
};


// Comprobación de autenticación
var authenticate = function(login, password){
    return models.User.findOne({ where : { username: login } }).then(function(user){
      if(user && user.verifyPassword(password)){
        return user;
      } else {
        return null;
      }
    });
};

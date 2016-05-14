var express = require('express');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var userController = require('../controllers/user_controller');
var sessionController = require('../controllers/session_controller');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Quiz' });
});

/* GET authors page. */
router.get('/author', function(req, res, next) {
  res.render('author', { title: 'Autores' });
});

// Autoload de rutas que utilicen :quizId
router.param('quizId', quizController.load); // autoload :quizId

// Definicion de las rutas de sesion
router.get('/session',        sessionController.new);
router.post('/session',       sessionController.create);
router.delete('/session',       sessionController.destroy);

// Definicion de rutas de /quizzes
router.get('/quizzes',                      quizController.index);
router.get('/quizzes/:quizId(\\d+)',        quizController.show);
router.get('/quizzes/:quizId(\\d+)/check',  quizController.check);
router.get('/quizzes/new',                  sessionController.loginRequired, quizController.new);
router.post('/quizzes',                     sessionController.loginRequired, quizController.create);
router.get('/quizzes/:quizId(\\d+)/edit',   sessionController.loginRequired, quizController.ownershipRequired, quizController.edit);
router.put('/quizzes/:quizId(\\d+)',        sessionController.loginRequired, quizController.ownershipRequired, quizController.update);
router.delete('/quizzes/:quizId(\\d+)',     sessionController.loginRequired, quizController.ownershipRequired, quizController.destroy);


// Autoload de comentarios aceptados
router.param('commentId', commentController.load);

// Definicion de rutas de comentarios
router.get('/quizzes/:quizId(\\d+)/comments/new', sessionController.loginRequired, commentController.new);
router.post('/quizzes/:quizId(\\d+)/comments',    sessionController.loginRequired, commentController.create);
router.put('/quizzes/:quizId(\\d+)/comments/:commentId(\\d+)/accept', sessionController.loginRequired, quizController.ownershipRequired, commentController.accept);

// Autoload de rutas que utilicen :quizId
router.param('userId', userController.load); // autoload :quizId

// Definicion de rutas de cuenta
router.get('/users',                    userController.index);    // listado usuarios
router.get('/users/:userId(\\d+)',      userController.show);     // ver un usuario
router.get('/users/new',                userController.new);      // formulario sign in
router.post('/users',                   userController.create);   // registrar usuario
router.get('/users/:userId(\\d+)/edit', sessionController.loginRequired, sessionController.adminOrMyselfRequired, userController.edit);     // editar cuenta
router.put('/users/:userId(\\d+)',      sessionController.loginRequired, sessionController.adminOrMyselfRequired, userController.update);   // actualizar cuenta
router.delete('/users/:userId(\\d+)',   sessionController.loginRequired, sessionController.adminAndNotMyselfRequired, userController.destroy);  // borrar cuenta


module.exports = router;

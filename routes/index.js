var express = require('express');
var router = express.Router(); // inicializamos el router de express


// Cargamos los controladores donde hemos definido los middlewares que
// van a actuar cuando se reciba la ruta asignada
var quizController = require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var userController = require('../controllers/user_controller');
var sessionController = require('../controllers/session_controller');


/*
*  Las vistas EJS se generan en el objeto de respuesta res y se envian al cliente
*  con res.render(vista, parametros) donde:
*   - Vista: nombre del fichero con la vista, con expansión .ejs
*   - Parametros: es un objeto con parametros a sustituir en la vista
*/

/* A través de router mediante router.get(ruta, funcion) definimos la ruta
*  sobre la cual queremos que se actue y la funcion que debe actuar sobre
*  esa ruta. La funcion puede ser un middleware alojado en la carpeta de
*  controladores (MVC-R). Importamos más arriba los archivos donde se encuentran
*  estos middlewares para poder usarlos aqui.
*/


// GET home page ("/" es la ruta de acceso a la página principal)
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Quiz' });
});

/* GET authors page. */
router.get('/author', function(req, res, next) {
  res.render('author', { title: 'Autores' });
});

/* AUTOLOAD DE COMENTARIOS ACEPTADOS :commentId
*  Cada vez que una ruta contenga :commentId como parámetro se ejecutará este
*  middleware.
*/
router.param('commentId', commentController.load); // autoload :commentId

/* AUTOLOAD DE RUTAS QUE UTILICEN :userId
*  Cada vez que una ruta contenga :userId como parámetro se ejecutará este
*  middleware.
*/
router.param('userId', userController.load); // autoload :userId

/* AUTOLOAD DE RUTAS QUE UTILICEN :quizId
*  Cada vez que una ruta contenga :quizId como parámetro se ejecutará este
*  middleware.
*/
router.param('quizId', quizController.load); // autoload :quizId

// DEFINICION DE LAS RUTAS DE SESION
router.get('/session',          sessionController.new);       //formulario de login
router.post('/session',         sessionController.create);    //crear sesion
router.delete('/session',       sessionController.destroy);   //destruir sesion


// DEFINICION DE RUTAS DE /QUIZZES
router.get('/quizzes',                      quizController.index);
router.get('/quizzes/:quizId(\\d+)',        quizController.show);
router.get('/quizzes/:quizId(\\d+)/check',  quizController.check);
/* Los instaladores de middlewares como use, get, put... pueden instalar varios middlewares
*  que se ejecutarán en serie. get('ruta', MW1, MW2), instala MW1 y MW2. Primero se ejecutará
*  MW1, que puede pasar el control a MW2 mediante next()
*
*  Por ejemplo: sessionController.loginRequired se instala delante de las acciones de los controladores
*  que necesitan autenticación para impedir que los usuarios sin autenticar ejecuten operaciones no permitidas
*  para ellos, mostrándoles la pantalla de login, para indicarles que deben autenticarse antes.
*/
router.get('/quizzes/new',                  sessionController.loginRequired, quizController.new);
router.post('/quizzes',                     sessionController.loginRequired, quizController.create);
router.get('/quizzes/:quizId(\\d+)/edit',   sessionController.loginRequired, quizController.ownershipRequired, quizController.edit);
router.put('/quizzes/:quizId(\\d+)',        sessionController.loginRequired, quizController.ownershipRequired, quizController.update);
router.delete('/quizzes/:quizId(\\d+)',     sessionController.loginRequired, quizController.ownershipRequired, quizController.destroy);


/* DEFINICION DE RUTAS DE COMENTARIOS
*/
router.get('/quizzes/:quizId(\\d+)/comments/new', sessionController.loginRequired, commentController.new);
router.post('/quizzes/:quizId(\\d+)/comments',    sessionController.loginRequired, commentController.create);
router.put('/quizzes/:quizId(\\d+)/comments/:commentId(\\d+)/accept',    commentController.accept);


/* DEFINICION DE RUTAS DE CUENTA
*/
router.get('/users',                    userController.index);    // listado usuarios
router.get('/users/:userId(\\d+)',      userController.show);     // ver un usuario
router.get('/users/new',                userController.new);      // formulario sign in
router.post('/users',                   userController.create);   // registrar usuario
router.get('/users/:userId(\\d+)/edit', sessionController.loginRequired, sessionController.adminOrMyselfRequired, userController.edit);     // editar cuenta
router.put('/users/:userId(\\d+)',      sessionController.loginRequired, sessionController.adminOrMyselfRequired, userController.update);   // actualizar cuenta
router.delete('/users/:userId(\\d+)',   sessionController.loginRequired, sessionController.adminAndNotMyselfRequired, userController.destroy);  // borrar cuenta


module.exports = router;

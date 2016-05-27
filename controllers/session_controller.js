var models = require('../models');
var Sequelize = require('sequelize');
var url = require('url');

exports.logout = function(req, res, next){
  if(req.session.user){
    var currentTime = Date.now();
    var lastTime = req.session.user.lastTime;
    console.log('last time is '  + lastTime);
    console.log('current time is ' + currentTime);
    if(currentTime > (lastTime + 180000)){
      delete req.session.user; //Logout borra propiedad user en req.session
      req.flash('info', 'La sesión ha expirado. Inicie sesión de nuevo, por favor.');
      res.redirect('/session'); //redirect a login
    } else {
      req.session.user.lastTime = currentTime;
      next();
    }
  } else { next(); }
};


/* Este middleware indica si un usuario está autenticado o no. Si lo está pasará el controladores
*  al siguiente middleware mediante next(). Si no lo está redirigirá a la página de login guardando
*  en 'redir' la página a la que ha intentado acceder para que una vez se autentique sea redirigido
* a esta y no tenga que recorrer de nuevo el camino.
*/
exports.loginRequired = function(req, res, next){
  if(req.session.user){ // Comprueba que el usuario está registrado
    next();
  } else {
    res.redirect('/session?redir=' + (req.param('redir') || req.url));
    // redirige a /session y envía como parametro req.url (página actual)
  }
};


/* GET /session -- FORMULARIO DE LOGIN
*  Declaración de la variable redir:
*    1. El parametro redir que llega en la query redir tiene preferencia
*    2. referer es un parametro de la la cabecera de la solicitud HTTP con el url de la
*     página que la origino
*    3. "/" es el valor por defecto si ninguno de los dos anteriores está definido
*  Hay dos casos en los que redir lleva a la página de incicio:
*    1. Si redir es la url de "/session" (estas en el formulario de login, acabas de iniciar sesion o
*       acabas de cerrarla)
*    2. Si es la url de "/users/new"
*/
exports.new = function(req, res, next){
  var redir = req.query.redir || url.parse(req.headers.referer || "/").pathname;
  if (redir === '/session' || redir === '/users/new'){ redir = '/'; }
  res.render('session/new', { redir: redir });
};


/* POST /session -- CREAR SESION
*  Obtiene del cuerpo de la request los parametros redir, login y password para usarlos en la comprobación.
*  Empieza guardando estos datos en variables. Después autentica mediante una funcion la pareja usuario/contraseña.
*  Esta funcion devuelve "user" si ha sido exitosa. Cuando devuelve user se inicia sesion con los datos de usuario
*  dentro del array req.session.user y redirige a "redir" para volver a la página donde estábamos. Si ha fallado el
*  login redirigimos a la pagina de login. Creamos un mensaje flash que nos advierta del error. Al redirigir a la
*  página de inicio de sesion enviamos dentro de la url el parametro redir para volver a usarlo otra vez.
*
*  El objeto req.session.user indica que el usuario esta autenticado y debe incluir el campo isAdmin de la base
*  de datos de usuarios para poder renderizar correctamente las vistas. 
*/
exports.create = function(req, res, next){
  var redir = req.body.redir || '/';
  var login = req.body.login;
  var password = req.body.password;

  authenticate(login, password).then(function(user){
    if(user){
      //Crear req.session.user y guardar campos id y username
      //La sesion se define por la existencia de: req.session.user
      req.session.user = { id: user.id, username: user.username, isAdmin: user.isAdmin, lastTime: Date.now() };
      res.redirect(redir); // añadimos redir para redirigir a la pagina de donde venimos
    } else {
      req.flash('error', 'La autenticación ha fallado. Reinténtelo otra vez.');
      res.redirect('/session?redir=' + redir); //guardamos redir en la request para recuperarle despues, ya que
      // aqui hemos redirigido a la pagina de inicio de sesion
    }
  }).catch(function(error){
    req.flash('error', 'Se ha producido un error: '+error);
    next(error);
  });
};


/* adminAndNotMyselfRequired COMPRUEBA SI ES EL ADMIN QUIEN INTENTA ACCEDER
*  Guarda en tres variables datos acerca de la sesion que esta activa:
*   - isAdmin: Guarda el valor del campo isAdmin del user de la sesion
*   - userId: Guarda la id del usuario
*   - loggedUserId: Guarad la id del usuario logueado
*  Si el usuario es administrador y ademas no es el propietario de la cuenta pasa el
*  control al siguiente middleware. Esta condición impide borrar la cuenta admin.
*/
exports.adminAndNotMyselfRequired = function(re, res, next){
  var isAdmin = req.session.user.isAdmin;
  var userId = req.user.id;
  var loggedUserId = req.session.user.id;

  if(isAdmin && userId !== loggedUserId){
    next();
  } else {
    console.log('Ruta prohibida: No es el usuario logueado ni un administrador.');
    res.send(403);
  }
};


/* adminOrMyselfRequired COMPRUEBA SI EL USUARIO QUE INTENTA ACCEDER TIENE PERMISO
*  Guarda en tres variables datos acerca de la sesion que esta activa:
*   - isAdmin: Guarda el valor del campo isAdmin del user de la sesion
*   - userId: Guarda la id del usuario
*   - loggedUserId: Guarda la id del usuario logueado
*  Si el usuario es administrador o las es el usuario propietario de la cuenta
*  pasa el control al siguiente middleware. Si no es asi envia un mensaje de error.
*/
exports.adminOrMyselfRequired = function(req, res, next){
  var isAdmin = req.session.user.isAdmin;
  var userId = req.user.id;
  var loggedUserId = req.session.user.id;

  if(isAdmin || userId === loggedUserId){
    next();
  } else {
    console.log('Ruta prohibida: No es el usuario logueado ni un administrador.');
    res.send(403);
  }
};


/* DELETE /session -- DESTRUIR SESION
*  Destruye la sesión. Simplemente borra la propiedad user en req.session y redirige a login.
*/
exports.destroy = function(req, res, next){
  delete req.session.user; //Logout borra propiedad user en req.session
  res.redirect('/session'); //redirect a login
};


/* COMPROBACIÓN DE AUTENTICACIÓN
*  Esta es la funcion que comprueba que el usuario se ha identificado correctamente.
*  Hace uso del metodo de la instancia mediante user.verifyPassword(password).
*  Devuelve user si ha habido exito y null si no lo ha habido.
*/
var authenticate = function(login, password){
    return models.User.findOne({ where : { username: login } }).then(function(user){
      if(user && user.verifyPassword(password)){
        return user;
      } else {
        return null;
      }
    });
};

/**
* Aplicacion express.js (node)
* Descripcion:
*  - bin: Directorio con ejecutables: www -  programa de arranque
*  - package.json: fichero de definición/configuración del paquete
*  - public: directorios de recursos públicos: imágenes, estilos y librerias Jscript
*  - routes: enrutador del modelo MVC-R
*  - views: vistas del modelo MVC-R
*
* --> www - programa de arranque: se importa como un modulo y se arranca como servidor en el
* puerto 3000
*
* --> El paquete package.json es un fichero en formato json que define las caracteristicas del
* paquete NPM de este proyecto. Los paquetes usados en el proyecto son las dependencias que se
* instalan con npm install. Los scripts son los comandos del proyecto.
*
* --> Routes: un Router de express es un MW que permite agrupar otros MWs de atencion a rutas.
*
* --> Views: Las vistas EJS se generan en el objeto de respuesta res y se envian al cliente
**/


// Importamos los paquetes como middlewares
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var partials = require('express-partials');
var flash = require('express-flash');
var methodOverride = require('method-override');
var routes = require('./routes/index');
var sessionController = require('./controllers/session_controller');

// Importamos enrutadores
var routes = require('./routes/index');

// Creamos la aplicación express.js
var app = express();

// En produccion (Heroku) redirijo las peticiones http a https.
if(app.get('env') === 'production'){
  app.use(function(req, res, next){
    if(req.headers['x-forwarded-proto'] !== 'https'){
      res.redirect('https://' + req.get('Host') + req.url);
    }
  });
}

// Instalamos el generador de vistas EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Instalamos los middlewares que usa la aplicación
app.use(partials());
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// El MW bodyparser.urlencoded(...) genera el objeto req.body.quiz cuando se
// configura con el parámetro { extended: true }
app.use(cookieParser());
app.use(session({ secret: 'Quiz 2016',resave: false,saveUninitialized: true }));
// Gestion de cookies
app.use(methodOverride('_method', {methods: ["POST", "GET"]}));
// Cargamos y configuramos el middleware methodOverride para que detecte
// el parametro oculto _method=xxx en POST y en GET.
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

// Helper dinamico:
app.use(function(req, res, next){
  //Hacer visible req.session en las vistas
  res.locals.session = req.session;
  next();
});

app.use(sessionController.logout);

// Instalamos enrutadores
// La ruta "/" de acceso a la página de entrada
app.use('/', routes);


// Gestión del error 404. Lo recogemos en un catch y redirigimos al manejador
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Manejadores de errores

// Manejador del error en desarrollo (development)
// Con este manejadore se imprimira en pantalla el error en la fase de desarrollo
// para tener informacion acerca de este y poder solucionarlo
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// Manejador del error en produccion (production)
// Con este manejador no se imprimira en la pantalla el error para que no aparezca
// en la pantalla del usuario en fase de produccion
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

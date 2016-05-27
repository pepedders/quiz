var models = require('../models');
var Sequelize = require('sequelize');

/* AUTOLOAD EL USER ASOCIADO A :userId
*  Del mismo modo, este middleware se ejecutará siempre que la ruta de la petición
*  contenga :userId como parámetro. De esta manera se creará siempre el objeto req.user
*  al que asignamos los datos de un usuario extraido de la base de datos. Asi podremos
*  acceder tanto a este como a sus propiedades (id...)
*/
exports.load = function(req, res, next, userId){
  models.User.findById(userId).then(function(user){
      if(user){
        req.user = user; // Asignamos a req.user la entrada de la base de datos correspondiente
        next();
      } else {
        req.flash('error', 'No existe el usuario con id='+id+'.');
        throw new Error('No existe userId=' + userId);
      }
    }).catch(function(error){ next(error); });
};


/* GET /users MUESTRA LA LISTA DE USUARIOS REGISTRADOS.
*  Accede a la base de datos de Usuarios mediante models.User. Una vez tiene el objeto efectua
*  una consulta mediante findAll() donde ordena los usuarios por su nombre de usuario
*  {order: ['username']} y después ejecuta una función de callback donde simplemente renderiza
*  la página a mostrar con la lista de usuarios contenida en el parametro "users".
*/
exports.index = function(req, res, next) {
  models.User.findAll({order: ['username']}).then(function(users){
    res.render('users/index', { users: users });
  }).catch(function(error){ next(error); });
};


/* GET /users/:id MUESTRA INFORMACIÓN ACERCA DEL USUARIOS LOGUEADO
*  Renderiza la vista entregando el parametro req.user a traves de user. Req.user es el objeto que
*  contiene la información del usuario.
*/
exports.show = function(req, res, next){
  res.render('users/show', { user: req.user });
};


/* GET /users/new MUESTRA EL FORMULARIO DE CREACIÓN DE USUARIO
*  Mediante .build() construye una nueva entrada en la base de datos donde guardará el nombre de usuario
*  y la contraseña que consigue a través del formulario renderizado.
*/
exports.new = function(req, res, next){
  var user = models.User.build({ username: "", password: "" });
  res.render('users/new', { user: user });
};


/* POST /users  CREA EL USUARIO E INTRODUCE SUS DATOS EN LA BASE DE DATOS
*
*/
exports.create = function(req, res, next){
  var user = models.User.build({ username: req.body.user.username, password: req.body.user.password });
  // El login debe ser unico:
  models.User.find({where: {username: req.body.user.username}}).then(function(existing_user){
    if(existing_user){
      var emsg = "El usuario \"" + req.body.user.username + "\" ya existe.";
      req.flash('error', emsg);
      res.render('users/new', { user: user });
    } else {
      // Guardar en la BBDD
      return user.save({ fields: ["username", "password", "salt"]}).then(function(user){
        req.flash('success', 'Usuario creado con éxito.');
        res.redirect('/session');
      }).catch(Sequelize.ValidationError, function(error){
        req.flash('error', 'Errores en el formulario:');
        for (var i in error.errors){
          req.flash('error', error.errors[i].value);
        };
      });
    }
  }).catch(function(error){
    next(error);
  });
};


// GET /users/:id/edit
exports.edit = function(req, res, next){
  res.render('users/edit', { user: req.user });
};


// PUT /users/:id
exports.update = function(req, res, next){
  //req.user.usermane = req.body.user.username; // No editar
  req.user.password = req.body.user.password;

  //El password no puede estar vacio
  if(!req.body.user.password){
    req.flash('error', 'El campo contraseña debe rellenarse.');
    return res.render('users/edit', { user: req.user });
  }
  req.user.save({fields: ["password", "salt"]}).then(function(user){
    req.flash('success', 'Usuario actualizado con éxito.');
    res.redirect('/users'); // Redirección HTTP a /
  }).catch(Sequelize.ValidationError, function(error){
    req.flash('error', 'Errores en el formulario:');
    for (var i in error.errors){
      req.flash('error', error.errors[i].value);
    };
  }).catch(function(error) { next(error); });
};


/* DELETE /users/:id -- Borra el usuario
*
*/
exports.destroy = function(req, res, next){
  req.user.destroy().then(function(){
    //Borrando usuario logueado
    if(req.session.user && req.session.user.id === req.user.id){
      //Borra la sesión y redirige a /
      delete req.session.user;
    }
    req.flash('success', 'Usuario eliminado con éxito.');
    res.redirect('/');
  }).catch(function(error){
    next(error);
  });
};

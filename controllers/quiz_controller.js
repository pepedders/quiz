// Hacemos que el controlador importe el modelo que hemos creado en models/models.js
var models = require('../models');
var Sequelize = require('sequelize');


/*
*  El parámetro "include:[models.Comment]" de findbyId(...) solicita cargar el array de
*  comentarios asociados al Quiz a través de la relación 1-a-N entre Quiz y Comment (en la
*  propiedad quiz.Comments)
*/

/* AUTOLOAD EL QUIZ ASOCIADO A :quizId
*  Se ejecuta con todas las peticiones que lleven quizId como parámetro en la ruta. Por ello
*  para todas estas peticiones se creara el objeto req.quiz al que asociamos un quiz de la base
*  de datos de los quizzes, y podemos usar tanto el objeto como sus propiedades (id...)
*/
exports.load = function(req, res, next, quizId){
  models.Quiz.findById(quizId, {include: [ models.Comment ]}).then(function(quiz){
    if(quiz){
      req.quiz = quiz;
      next();
    } else {
      next(new Error('No existe quizId=' + quizId));
    }
  }).catch(function(error) { next(error); });
};


/* Ownership requied VERIFICA QUE EL USUARIO ES PROPIETARIO DEL QUIZ O ES ADMIN
*  Guarda en tres variables los datos necesarios para hacer la comprobacion:
*   - isAdmin: Comprueba si el usuario logueado tiene permisos de administrador
*   - quizAuthorId: Guarda el id del Autor del Quiz
*   - loggedUserId: Guarda el id del usuario logueado
*  Si el usario tiene permisos de administrador o es el propietario del quiz pasa el control al
*  siguiente middleware. Si no lo es envia un error.
*/
exports.ownershipRequired = function(req, res, next){
  var isAdmin = req.session.user.isAdmin;
  var quizAuthorId = req.quiz.AuthorId;
  var loggedUserId = req.session.user.id;

  if(isAdmin || quizAuthorId === loggedUserId){
    next();
  } else {
    console.log('Operación prohibida: El usuario logueado no es el autor del quiz ni un administrador.');
    res.send(403);
  }
};


/* Get /quizzes MUESTRA LOS QUIZZES ALMACENADOS SIGUIENDO UN CRITERIO DE busqueda
*  Primero se declara la variable search, que será un string vacio si no se esta buscando nada
*  o contendra el contenido de lo escrito en el cajetin de busqueda.
*  Se declara la expresion regular para buscar los espacios en blanco.
*  Se declara la variable busqueda que sera la variable que se compare con los campos del contenido de
*  los quizzes. Se introduce un % al principio y otro al final y otros en aquellos espacios en blanco
*  que contenga la string de busqueda para separar los criterios de busqueda y que estos puedan estar en
*  cualquier parte del string de la pregunta.
*  Hemos declarado tambien una variable adicional de informacion para mostrarla junto con los resultados de
*  manera que el usuario sepa en todo momento a que busqueda corresponden los resultados mostrados.
*
*  Pasando como parametros de findAll la sentencia {question: {$like: busqueda}} realizaremos una busqueda en
*  el campo question de los quizes del contenido de la variable busqueda. Mediante then ejecutamos una sentencia
*  .sort que ordena los resultados y renderizamos la vista entregando como parametros el array de quizzes y la
*  informacion de la busqueda.
*/
exports.index = function(req, res, next){
  var search = req.query.search || '';
  var reg = new RegExp(' ', 'g');
  var busqueda = '%' + search.replace(reg, '%') + '%';
  var jsun = '% %';
  var info = search;
  if (req.url != ("/quizzes.json")){
    models.Quiz.findAll({where: {question: {$like: busqueda}}}).then(function(quizzes){
      quizzes.sort();
      res.render('quizzes/index.ejs', { quizzes: quizzes, info: info});
    }).catch(function(error){ next(error);});
  }else {
    models.Quiz.findAll({where:{question:{$like: jsun}}}).then(function(quizzes){
      quizzes.sort();
      return res.json(quizzes);
    }).catch(function(error){next(error);});
  }
};


/* GET /quizzes/:id MUESTRA EL QUIZ CON LA ID CORRESPONDIENTE
*  Este middleware habrá hecho previamente uso del middleware autoload de quiz de manera
*  que podemos usar el objeto req.quiz y acceder a su propiedad id para buscarlo en la base
*  de datos. Guardamos el quiz en quiz si lo encontramos. De modo que si quiz queda defnindo (if(quiz))
*  ejecutaremos el codigo condicionado. Guardamos en answer la respuesta y renderizaremos la vista.
*/
exports.show = function(req, res, next){
  models.Quiz.findById(req.quiz.id).then(function(quiz){
    if (quiz){
      var answer = req.query.answer || '';
      res.render('quizzes/show', { title: 'pregunta', id: req.quiz.id, quiz: req.quiz, answer: answer});
    }
    else{
      throw new Error('No existe ese quiz en la base de datos.');
    }
  }).catch(function(error){ next(error);});
};


/* GET /quizzes/:quizId/check COMPROBAMOS SI LA RESPUESTA ES CORRECTA
*  Este middleware habrá hecho previamente uso del middleware autoload de quiz de manera
*  que podemos usar el objeto req.quiz y acceder a su propiedad id para buscarlo en la base
*  de datos. Si el quiz existe guardamos la respuesta, el resultado de comparar la respuesta del
*  usuario con la respuesta del objeto extraido de la base de datos, y hacemos tambien uso de
*  esta comparacion para determinar el color y el icono a renderizar en la vista. Por ultimo
*  renderizamos la vista pasando los parametros correspondientes.
*/
exports.check = function(req, res) {
  models.Quiz.findById(req.quiz.id).then(function(quiz){
    if (quiz){
      var answer = req.query.answer || '';
      var result = answer === req.quiz.answer ? 'correcta' : 'incorrecta';
      var color = answer === req.quiz.answer ? 'green' : 'red';
      var icon = answer === req.quiz.answer ? 'check' : 'times';
      res.render('quizzes/result', { quiz: req.quiz, title: 'respuesta', result: result, color: color, answer: answer, icon: icon });
    }
    else{
      throw new Error('No existe ese quiz en la base de datos');
    }
  }).catch(function(error) { next(error); });
};

/* GET /quizzes/new RENDERIZA EL FORMULARIO PARA CREAR UN NUEVO QUIZ.
*  El metodo build de sequelize crea un objeto no persistente asociado a la tabla Quiz, con
*  las propiedades inicializadas. Este objeto se utiliza aqui solo para renderizar las vistas
*  inicializando los cajetines con strings vacios.
*/
exports.new = function(req, res){
  var quiz = models.Quiz.build({ question: "", answer: "" });
  res.render('quizzes/new', { quiz: quiz });
};

/* POST /quizzes/create CREA EL QUIZ A PARTIR DE LOS DATOS INTRODUCIDOS POR EL USUARIO
*  Genera el objeto quiz con models.Quiz.build(req.body.quiz), incicializandolo con los parametros
*  enviados desde el formulario, que están accesibles en req.body.quiz.
*  quiz.save({fields: ["pregunta", "respuesta"]}) almacena el objeto no persistente quiz en la tabla
*  Quiz de la base de datos. Como este objeto se ha creado nuevo con un build, se crea una nueva
*  entrada en la tabla Quiz.
*  Esta primitiva no tiene vista asociada, Al acabar realiza una redirección HTTP a la lista de preguntas
*  con res.redirect('/quizzes').
*/
exports.create = function(req, res, next){
  var authorId = req.session.user && req.session.user.id || 0;
  var quiz = models.Quiz.build({ question: req.body.quiz.question, answer: req.body.quiz.answer, AuthorId : authorId} );
  // Guarda en db los campos pregunta y respuesta de quiz
  quiz.save({fields: ["question", "answer", "AuthorId"]}).then(function(){
    req.flash('success', 'Quiz creado con éxito');
    res.redirect('/quizzes');
  }).catch(Sequelize.ValidationError, function(error){
    req.flash('error', 'Errores en el formulario: ');
    for(var i in error.errors){
      req.flash('error', error.errors[i].value);
    };
    res.render('quizzes/new', { quiz: quiz });
  }).catch(function(error) {
    req.flash('error', 'Error al crear un quiz: ' + error.message);
    next(error)
  });
};

/* GET /quizzes/:id/edit MUESTRA EL QUIZ A EDITAR
*  Hace uso de el middleware autoload para recuperar el quiz asociado a la id
*  correspondiente y lo entrega al renderizador de vista para que lo muestre en
*  los campos del formulario.
*/
exports.edit = function(req, res, next){
  var quiz = req.quiz;
  res.render('quizzes/edit', {quiz:quiz});
};

/* PUT /quizzes/:id ACTUALIZA LA ENTRADA DE LA BASE DE DATOS DEL QUIZ
*  R
*/
exports.update = function(req, res, next){
  req.quiz.question = req.body.quiz.question;
  req.quiz.answer = req.body.quiz.answer;
  req.quiz.save({fields: ["question", "answer"]}).then(function(quiz){
    req.flash('success', 'Editado con éxito');
    res.redirect('/quizzes');
  }).catch(Sequelize.ValidationError, function(error){
    req.flash('error', 'Errores en el formulario:');
    for (var i in error.errors) {
      req.flash('error', error.errors[i].value);
    };
  }).catch(function(error){
    req.flash('error', 'Error al editar el Quiz: ' + error.message);
    next(error);
  });
};

// DELETE /quizzes/:id
exports.destroy = function(req, res, next){
  req.quiz.destroy().then( function(){
    req.flash('success', 'Quiz borrado con éxito.');
    res.redirect('/quizzes');
  }).catch(function(error){
    req.flash('error', 'Error al editar el Quiz: ' +error.message);
  });
};

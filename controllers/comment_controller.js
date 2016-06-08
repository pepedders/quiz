var models = require('../models');
var Sequelize = require('sequelize');

/* AUTOLOAD EL COMENTARIO ASOCIADO A :commentId
*  Se ejecuta con todas las peticiones que lleven :commentId como parámetro en la ruta. Por ello
*  para todas estas peticiones se creara el objeto req.comment al que asociamos un comentario de la base
*  de datos de los comentarios, y podemos usar tanto el objeto como sus propiedades (id...)
*/
exports.load = function(req, res, next, commentId){
  models.Comment.findById(commentId, { include: [models.User] }).then(function(comment){
    if(comment){
      req.comment = comment;
      next();
    } else {
      next(new Error('No exsiste el comentario con id: ' + commentId));
    }
  }).catch(function(error) { next(error); });
};


/* GET /quizzes/:quizId/comments/new MUESTRA EL FORMULARIO PARA CREAR COMENTARIOS
*  Instancia el formulario de crear comentarios.
*  Con la vista renderiza los objetos comment(para construir la entrada de la base de datos)
*  y quiz con el quiz al que se refiere el comentario.
*/
exports.new = function(req, res, next){
  var comment = models.Comment.build({text: ""});
  res.render('comments/new', { comment: comment, quiz: req.quiz });
};


/* POST /quizzes/:quizId/comments
*  Middleware que crea el comentario y lo introduce en la base de datos. Lleva el
*  parámetro :quizId en la ruta, por lo que la función de autoload de quiz_controller.js
*  cargará el quiz asociado. Esto nos permite asignar req.quiz.id al campo QuizId
*/
exports.create = function(req, res, next){
  var comment = models.Comment.build(
    { text: req.body.comment.text,
      QuizId: req.quiz.id,
    });
  comment.save({fields: ["text", "QuizId"]}).then(function(comment){
    req.flash('success', 'Comentario creado con éxito. ');
    res.redirect('/quizzes/' + req.quiz.id);
  }).catch(Sequelize.ValidationError, function(error){
    req.flash('error', 'Errores en el formulario: ');
    for(var i in error.errors){
      req.flash('error', error.errors[i].value);
    };
    res.render('comments/new', {comment: comment, quiz: req.quiz});
  }).catch(function(error){
    req.flash('error', 'Error al crear un comentario: ' + error.message);
    next(error);
  });
};

/* GET / quizzes/:quizId/comments/:commentId/accept ACEPTA EL COMENTARIO
*  Cambia el valor accepted del objeto comment contenido en la request a true.
*  Actualiza la base de datos con .save()
*  Si no ha habido errrores redirigue a la página de quiz de la que veniamos.
*/
exports.accept = function(req, res, next){
  req.comment.accepted = true;
  req.comment.save(["accepted"]).then(function(comment){
    req.flash('success', 'Comentario aceptado con éxito.');
    res.redirect('/quizzes/' + req.params.quizId);
  }).catch( function(error){
    req.flash('error', 'Error al aceptar un Comentario: ' + error.message);
    next(error);
  });
};

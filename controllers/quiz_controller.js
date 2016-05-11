// Hacemos que el controlador importe el modelo que hemos creado en models/models.js
var models = require('../models');
var Sequelize = require('sequelize');

// Autoload el quiz asociado a :quizId
exports.load = function(req, res, next, quizId){
  models.Quiz.findById(quizId, { include: [ models.Comment ] }).then(function(quiz){
    if(quiz){
      req.quiz = quiz;
      next();
    } else {
      next(new Error('No existe quizId=' + quizId));
    }
  }).catch(function(error) { next(error); });
};


// Get /quizzes
exports.index = function(req, res, next){
  var search = req.query.search || '';
  var reg = new RegExp(' ', 'g', 'i');
  var busqueda = '%' + search.replace(reg, '%') + '%';
  var info = search;
  models.Quiz.findAll({where: {question: {$like: busqueda}}}).then(function(quizzes){
      quizzes.sort();
      res.render('quizzes/index.ejs', { quizzes: quizzes, info: info});
  }).catch(function(error){ next(error);});
};


// GET /quizzes/:id
exports.show = function(req, res, next){
  models.Quiz.findById(req.params.quizId).then(function(quiz){
    if (quiz){
      var answer = req.query.answer || '';
      res.render('quizzes/show', { title: 'pregunta', id: req.params.quizId, quiz: req.quiz, answer: answer});
    }
    else{
      throw new Error('No existe ese quiz en la base de datos.');
    }
  }).catch(function(error){ next(error);});
};


// GET /quizzes/:id/check
exports.check = function(req, res) {
  models.Quiz.findById(req.params.quizId).then(function(quiz){
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

// GET /quizzes/new
exports.new = function(req, res){
  var quiz = models.Quiz.build({ question: "", answer: "" });
  res.render('quizzes/new', { quiz: quiz });
};

// POST /quizzes/create
exports.create = function(req, res, next){
  var quiz = models.Quiz.build({ question: req.body.quiz.question, answer: req.body.quiz.answer} );
  // Guarda en db los campos pregunta y respuesta de quiz
  quiz.save({fields: ["question", "answer"]}).then(function(){
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
    next(error) });
};

// GET /quizzes/:id/edit
exports.edit = function(req, res, next){
  var quiz = req.quiz;
  res.render('quizzes/edit', {quiz:quiz});
};

// PUT /quizzes/:id
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

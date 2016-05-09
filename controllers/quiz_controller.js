// Hacemos que el controlador importe el modelo que hemos creado en models/models.js
var models = require('../models');


// GET /question
exports.question = function(req, res, next){
  models.Quiz.findOne().then(function(quiz){
    if (quiz){
      var answer = req.query.answer || '';
      res.render('quizes/question', {title: 'pregunta', question: quiz.question, answer: answer});
    }
    else{
      throw new Error('No hay preguntas en la BBDD.');
    }
  }).catch(function(error){ next(error);});
};


// GET /check
exports.check = function(req, res, next) {
  models.Quiz.findOne().then(function(quiz){
    if (quiz){
      var answer = req.query.answer || '';
      var result = answer === quiz.answer ? 'correcta' : 'incorrecta';
      var color = answer === quiz.answer ? 'green' : 'red';
      res.render('quizes/answer', { title: 'respuesta', result: result, color: color, answer: answer });
    }
    else{
      throw new Error('No hay preguntas en la BBDD.');
    }
  }).catch(function(error) { next(error); });
};

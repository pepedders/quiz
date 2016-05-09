// var models = require('../models');

// GET /question
// exports.question = function(req, res, next){
//   models
//   .Quiz
//   .findOne() // Busca la primera preguntas
//   .then(function(quiz){
//     if (quiz){
//       var answer = req.query.answer || '';
//       res
//       .render('quizzes/question', {question: quiz.question, answer: answer});
//     }
//     else{
//       throw new Error('No hay preguntas en la BBDD.');
//     }
//   }).catch(function(error){ next(error);});
// };

// GET /question
exports.question = function(req, res){
  res.render('quizes/question', {title: 'Pregunta', question: '¿Cual es la capital de Italia?'});
};

// GET /answer
exports.answer = function(req, res){
  if(req.query.answer === 'Roma'){
    res.render('quizes/answer', {title: 'Respuesta', answer: 'Correcta'});
  }else{
    res.render('quizes/answer', {title: 'Respuesta', answer: 'Incorrecta'});
  }
};

// GET /check
// exports.check = function(req, res, next) {
//   models
//   .Quiz
//   .findOne() // Busca la primera preguntas
//   .then(function(quiz){
//     if (quiz){
//       var answers = req.query.answer || '';
//       var result = answer === quiz.answer ? 'Correcta' : 'Incorrecta';
//       res.render('quizzes/result', { result: result, answer: answer });
//     }
//     else{
//       throw new Error('No hay preguntas en la BBDD.');
//     }
//   }).catch(function(error) { next(error); });
// };

// Hacemos que el controlador importe el modelo que hemos creado en models/models.js
var models = require('../models');

// Get /quizzes
exports.index = function(req, res, next){
  var search = req.query.search || '';
  var reg = new RegExp(' ', 'g', 'i');
  var busqueda = '%' + search.replace(reg, '%') + '%';
  var info = search;
  models.Quiz.findAll({where: {question: {$ilike: busqueda}}}).then(function(quizzes){
      quizzes.sort();
      res.render('quizzes/index.ejs', { quizzes: quizzes, info: info});
  }).catch(function(error){ next(error);});
};


// GET /quizzes/:id
exports.show = function(req, res, next){
  models.Quiz.findById(req.params.quizId).then(function(quiz){
    if (quiz){
      var answer = req.query.answer || '';
      res.render('quizzes/show', { title: 'pregunta', id: req.params.quizId, quiz: quiz, answer: answer});


    }
    else{
      throw new Error('No existe ese quiz en la base de datos.');
    }
  }).catch(function(error){ next(error);});
};

// GET /search?search=...
exports.search = function(req, res, next){
  models.Quiz.findAll().then(function(quizzes){
    var busqueda = req.query.search || '';
    var patt = new RegExp(busqueda, "i");
    var searchArray = [];
    for(var i in quizzes){
      if(patt.test(quizzes[i].question)){
        var element = {id:quizzes[i].id, question:quizzes[i].question};
        searchArray.push(element);
      }
    }
    searchArray.sort();
    res.render('quizzes/search', { searchArray: searchArray });
  }).catch(function(error) { next(error); });
};


// GET /quizzes/:id/check
exports.check = function(req, res) {
  models.Quiz.findById(req.params.quizId).then(function(quiz){
    if (quiz){
      var answer = req.query.answer || '';
      var result = answer === quiz.answer ? 'correcta' : 'incorrecta';
      var color = answer === quiz.answer ? 'green' : 'red';
      res.render('quizzes/result', { title: 'respuesta', result: result, color: color, answer: answer });
    }
    else{
      throw new Error('No existe ese quiz en la base de datos');
    }
  }).catch(function(error) { next(error); });
};

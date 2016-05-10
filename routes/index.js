var express = require('express');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Quiz' });
});

/* GET authors page. */
router.get('/author', function(req, res, next) {
  res.render('author', { title: 'Autores' });
});

// Definicion de rutas de /quizzes
router.get('/quizzes',                      quizController.index);
router.get('/quizzes/:quizId(\\d+)',        quizController.show);
router.get('/quizzes/:quizId(\\d+)/check',  quizController.check);
router.get('/quizzes/search',               quizController.search);


module.exports = router;

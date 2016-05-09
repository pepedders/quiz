var express = require('express');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Quiz' });
});

router.get('/author', function(req, res, next) {
  res.render('author', { title: 'Autores' });
});

router.get('/quizes/question', quizController.question);
router.get('/quizes/answer', quizController.check);

module.exports = router;

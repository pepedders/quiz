var path = require('path');


// Cargar Modelo ORM
var Sequelize = require('sequelize');

// Usar BBDD sqlite
//  DATABASE_URL = sqlite:///
//  DATABASE_STORAGE = quiz.sqlite
// Usar BBDD Postgres:
//  DATABASE_URL = postgres...

var url, storage;

if(!process.env.DATABASE_URL){
  url = "sqlite:///";
  storage = "quiz.sqlite";
} else {
  url = process.env.DATABASE_URL;
  storage = process.env.DATABASE_STORAGE || "";
}

var sequelize = new Sequelize(url, { storage: storage, omitNull: true });


// Importar la definicion de la tabla Quiz de quiz.js
var Quiz = sequelize.import(path.join(__dirname, 'quiz'));

// Importar la definicion de la tabla Comments de comment.js
var Comment = sequelize.import(path.join(__dirname, 'comment'));

// Importar la definicion de la tabla Users de user.js
var User = sequelize.import(path.join(__dirname, 'user'));

// Relaciones entre modelos
Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);

// sequelize.sync() crea e inicializa tabla de preguntas en DB
sequelize.sync().then(function(){
  return Quiz.count().then(function(c){
      if (c === 0){ // la tabla se inicializa si esta vacia
        return Quiz.bulkCreate([{question: '¿Capital de Italia?', answer: 'Roma'},
                           {question: '¿Capital de Portugal?', answer: 'Lisboa'},
                           {question: '¿Capital de España?', answer: 'Madrid'},
                           {question: '¿Capital de Inglaterra?', answer: 'Londres'}
                          ]).then(function(){console.log('Base de datos inicializada con datos')});
      }else{console.log('La base de datos ya existe.')}

    });
}).catch(function(error){
  console.log("Error soncronizando las tablas de la BBDD:", error);
  process.exit(1);
});

exports.Quiz = Quiz; // exportar definicion de tabla Quiz
exports.Comment = Comment; // exportar la definicion de tabla Comments
exports.User = User; // exportar la definicion de tabla User

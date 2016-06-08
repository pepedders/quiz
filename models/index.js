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

/* RELACIONES ENTRE MODELOS
*  Las relaciones entre modelos permiten asociar elementos de tablas diferentes
*  Hay tres tipos de relaciones basicas: 1-a-1, 1-a-N, y N-a-N:
*   - Relación 1-a-1: asocia 1 elemento con otro elemento de otra tabla
*   - Relación 1-a-N: asocia 1 elemento con N elementos de otra tabla (Por ejemplo,
*     una pregunta puede tener varios comentarios).
*   - Relación N-a-N: asocia N elementos con N elementos de otra tabla (Por ejemplo,
*     N preguntas gustan a N usuarios)
*  Las relaciones se definen con métodos heredados del modelo:
*    1-a-1: belongsTo()   &   hasOne()
*    1-a-N: belongsTo()   &   hasMany()
*    N-a-N: belongsToMany() & hasMany()
*
*/

/* GESTION DE BASES DE DATOS CON SEQUELIZE-CLI
*   Tras instalar sequielize-cli podemos quitar el siguiente bloque de codigos ya que
*   a partir de ahora la sincronizacion e inicializacion de las bases de datos las hare
*   mos a traves de los comandos de sequelize-cli.
*
*   Los comandos de sequelize-cli (sequelize command line interpreter) permiten gestionar
*   la evolucion de la base de datos de acuerdo a las necesidades de las diferentes versiones
*   del proyecto a medida que este va evolucionando
*
*   Entre todos los comandos los que más usamos son:
*     - db:seed -- comando que ejecuta los seeders (ficheros que rellenan las tablas)
*     - db:migrate -- comando que ejecuta migraciones pendientes
*
*   Definiciones:
*     - Una migración define de forma incremental los cambios que se realizan en un determinado
*       paso de diseño en la base de datos
*     - Un fichero seed define de forma incremental y reversible la inicializacion de la base de
*       datos en cada paso. Contiene los datos con los que se rellena la base de datos
*
*   Comandos:
*     - init:migrations: Este comando permite crear el directorio y el esqueleto del fichero de migración
*       que debe modificarse a mano. El nombre de cada fichero de migración indica cuando se creo y define
*       de forma reversible e incremental los cambios en la base de datos.
*     - migration:create Crea el fichero de migración donde se definen las funciones que actuan sobre la base
*       de datos:
*       -- La funcion up define como realizar los cambios en la base de datos. sync({force: true}) indica que
*          los cambios deben forzarse al arrancar la aplicación si hay alguna incompatibilidad o error.
*       -- La funcion down define como deshacer los cambios en la base de datos.
*     - init:seeders: Este comando permite crear el directorio y el esqueleto del fichero de inicializacion (seed)
*       que debe modificarse a mano. El nombre de cada fichero de inicialización indica cuando se creo y define de
*       de forma reversible e incremental la inicialización de la base de datos.
*     - seed:create: Crea el fichero de inicializacion donde se definen las funciones que actuan sobre la base
*       de datos:
*       -- La función up define como realizar los cambios en la base de datos.
*       -- La función down define como deshacer los cambios en la base de datos.
*
*   Podemos añadir en package.json los comandos a ejecutar para las migraciones y las inicializacionesL.
*     - "migrate_local": "./node_modules/.bin/sequelize db:migrate --url sqlite://$(pwd)/quiz.sqlite",
*     - "seed_local: "./node_modules/.bin/sequelize db:seed -- url sqlite://$(pwd)/quiz.sqlite"
*/


/* La relación de tipo 1-a-N entre Quiz y Comment se define en models.js con:
*   - Comment.belongsTo(Quiz); indica que los Comentarios pertenece a un Quiz. Además añade el
*     campo QuizId en la tabla Comment para asociar el comentario a el quiz asociado a través de
*     la relación
*   - Quiz.hasMany(Comment);  indica que un Quiz puede tener varios Comentarios
*  La columna "QuizId" de la tabla "Comment" es la clave externa (foreignKey) del quiz del comentario
*/
Comment.belongsTo(Quiz); // Relacion 1 a N entre Quiz y Comments
Quiz.hasMany(Comment); // Relacion 1 a N entre Quiz y Comments

/* La relación de tipo 1-a-N entre User y Comment se define en models.js con:
*   - Comment.belongsTo(User, {foreignKey: 'AuthorId'}); indica que los Comentarios pertenece a un Usuario
*   - User.hasMany(Comment, {foreignKey: 'AuthorId'}); indica que un Usuario puede tener varios Comentarios
*  Declaramos las claves externas
*/
Comment.belongsTo(User, {foreignKey: 'AuthorId'}); // Relacion 1 a N entre User y Comments
User.hasMany(Comment, {foreignKey: 'AuthorId'}); // Relacion 1 a N entre User y Comments

/* La relación de tipo 1-a-N entre User y Quiz se define en models.js con:
*   - Quiz.belongsTo(User, {as: 'Author', foreignKey: 'AuthorId'}); indica que los Quizes pertenece a un Usuario
*   - User.hasMany(Quiz, {foreignKey: 'AuthorId'}); indica que un Usuario puede tener varios Quizzes
*/
Quiz.belongsTo(User, {as: 'Author', foreignKey: 'AuthorId'}); // Relacion 1 a N entre User y Quiz
User.hasMany(Quiz, {foreignKey: 'AuthorId'}); // Relacion 1 a N entre User y Quiz


// sequelize.sync() crea e inicializa tabla de preguntas en DB
// sequelize.sync().then(function(){
//   return Quiz.count().then(function(c){
//       if (c === 0){ // la tabla se inicializa si esta vacia
//         return Quiz.bulkCreate([{question: '¿Capital de Italia?', answer: 'Roma'},
//                            {question: '¿Capital de Portugal?', answer: 'Lisboa'},
//                            {question: '¿Capital de España?', answer: 'Madrid'},
//                            {question: '¿Capital de Inglaterra?', answer: 'Londres'}
//                           ]).then(function(){console.log('Base de datos inicializada con datos')});
//       }else{console.log('La base de datos ya existe.')}
//     });
// }).catch(function(error){
//   console.log("Error soncronizando las tablas de la BBDD:", error);
//   process.exit(1);
// });

exports.Quiz = Quiz; // exportar definicion de tabla Quiz
exports.Comment = Comment; // exportar la definicion de tabla Comments
exports.User = User; // exportar la definicion de tabla User

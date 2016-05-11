// Definicion del modelo quiz

module.exports = function(sequelize, DataTypes){
  return sequelize.define(
    'Quiz',
    { question: { type: DataTypes.STRING,
                  validate: { notEmpty: {msg: "Debes introducir una pregunta"}}
                },
      answer:   { type: DataTypes.STRING,
                  validate: { notEmpty: {msg: "Debes introducir una respuesta"}}
                }
    });
};

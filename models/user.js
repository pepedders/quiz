var crypto = require('crypto');

// Definicion de la clase User:
module.exports = function(sequelize, DataTypes){
  return sequelize.define('User',
    { username: {
        type: DataTypes.STRING,   unique: true,   validate: { notEmpty: {msg:"Introducir nombre de usuario"}}
    },
      password: {
        type: DataTypes.STRING,   validate: { notEmpty: {msg: "Introducir contraseña"}},
        set: function(password){
          //String aleatorio usado como salt.
          this.salt = Math.round((new Date().valueOf() * Math.random())) + '';
          this.setDataValue('password', encryptPassword(password, this.salt));
        }
    },
      salt: {
        type: DataTypes.STRING
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
  },
  /* INSTANCEMETHODS:
  *  Es una propiedad que permite definir metodos de instancia de la clase User.
  *  Los objetos que se intercambian con la base de datos deben ser de la clase User.
  */
  { instanceMethods: {
    verifyPassword: function(password){
      return encryptPassword(password, this.salt) === this.password;
    }}
  });
};


// Encripta un password en claro.
// Mezcla un password en claro con el salt proporcionado, ejecuta SHA1 digest,
// y devuelve 40 caracteres hexadecimales.

function encryptPassword(password, salt){
  return crypto.createHmac('sha1', salt).update(password).digest('hex');
};

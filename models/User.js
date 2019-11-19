'use strict';
const bcrypt = require('bcryptjs');

module.exports = function(db, DataTypes) {
  const User = db.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isLowercase: true,
            isEmail: true
        }
  },
     password: {
        type: DataTypes.STRING,
        allowNull: false
     },
     firstName: DataTypes.STRING,
     lastName: DataTypes.STRING
  });
  
User.addHook('beforeCreate', (user, options) => {
    return new Promise((resolve, reject) => {
        if(user.changed('password')) {
            User.hashPassword(user.password)
            .then(hash => {
                user.password = hash;
                resolve();
            })
          } else {
              resolve();
          }
       
    })
    
  });
  
  User.prototype.serialize = function() {
  return {
    email: this.email || '',
    firstName: this.firstName || '',
    lastName: this.lastName || '',
    id: this.id || ''
  };
};

User.prototype.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

User.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};
  
  return User;
}

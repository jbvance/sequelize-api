const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const chalk = require('chalk');
const cors = require('cors');
const passport = require('passport');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env" });

// load sequelize models
const models = require('./models');
//console.log("MODELS", models);
const User = models.User;

//Passport strategies
const { localStrategy, jwtStrategy } = require('./config/passport-strategies');


const app = express();

// CORS
app.use(function (req, res, next) { 
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

const jwtAuth = passport.authenticate('jwt', { session: false });

passport.use(localStrategy);
passport.use(jwtStrategy);

const usersRouter = require('./routers/users');
const authRouter = require('./routers/auth');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.set("host", process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0");
app.set("port", process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);

app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);

app.get('/', (req, res, next) => {
    User.findAll()
        .then(users => {
            return res.status(200).json({ users });
        })
        .catch(err => next(err));
});

let server;

function runServer() {  
  return new Promise((resolve, reject) => {
    models.sequelize.sync() 
    //models.sequelize.sync({ force: true })
        .then(() => {
            server = app.listen(app.get("port"), () => {
              console.log(
                "%s App is running at http://localhost:%d in %s mode",
                chalk.green("✓"),
                app.get("port"),
                app.get("env")
              );
              console.log("  Press CTRL-C to stop\n");
            });
            resolve();
            
           //return User.create({ name: 'Max', email: 'test@test.com', password: 'password' })
        })
        .catch(err => {
          reject(err);
        })
  })      
}

function closeServer() {      
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });    
}

if (require.main === module) {
  console.log("RUNNING SERVER");
  runServer().catch(err => console.error(err));
}
    
module.exports = { app, runServer, closeServer };





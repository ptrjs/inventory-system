const express = require('express');
const httpStatus = require('http-status');
const helmet = require('helmet');
const xss = require('xss-clean');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const routes = require('./routes/v1');
//const routesWeb = require('./routes');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const { jwtStrategy } = require('./config/passport');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerOptions = require('./swaggerOption');
//const expressLayout = require('express-ejs-layouts');
//const flash = require('express-flash');
//const session = require('express-session');
//const methodOverride = require('method-override');
//const path = require('path');
//const { userService, authService, tokenService } = require('./services');
const prisma = require('../prisma/client');
//const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { auth } = require('./middlewares/auth');
//const { addTokenToHeader } = require('./middlewares/addTokenToHeader');
//const { tokenTypes } = require('./config/tokens');
//const { checkNotAuthenticate, checkAuthenticate } = require('./middlewares/checkAuth');


const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}


app.use(passport.initialize());
app.use(passport.session());
passport.use('jwt', jwtStrategy);


// set security HTTP headers
app.use(helmet());

// aktifin parsing json
app.use(express.json());

// aktifin urlencoded
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());



app.get('/', (req, res) => {
  res.send('hello world');
});
// v1 api routes
app.use('/v1', routes);



const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// send 404 error jika route tidak ada
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});



// convert error jadi Instance API Error jika ada error yang tidak ketangkap
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;

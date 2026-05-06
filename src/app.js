import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from './utils/logger.js';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import cors from 'cors'

import indexRouter from './routes/index.js';
// import usersRouter from './routes/users.js';
import authRouter from './routes/auth.routes.js';
import slotRoute from './routes/slot.routes.js'
import appointmentRouter from './routes/appointment.route.js'

const app = express();
const swaggerDocument = YAML.load('./src/swaggerYaml/swagger.yaml');

// MIDDLEWARE
app.use(express.json())
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

const PORT = process.env.PORT || 3000


// ROUTES
app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/slots', slotRoute)
app.use('/appointments', appointmentRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Catch 404
app.use(function(req, res, next) {
  next(createError(404));
});

// Error Handler
app.use((err, req, res, next) => {
  if (logger && typeof logger.error === 'function') {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl}`);
  } else {
    console.error('Winston logger missing:', err);
  }

  res.status(err.status || 500).json({
    status: "error",
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

export default app;
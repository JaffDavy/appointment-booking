import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from './utils/logger.js';
import morgan from 'morgan';

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import authRouter from './routes/auth.routes.js';
import slotRoute from './routes/slot.routes.js'
import appointmentRouter from './routes/appointment.route.js'

const app = express();

// MIDDLEWARE
app.use(morgan('dev'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ROUTES
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/slots', slotRoute)
app.use('/appointments', appointmentRouter)

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
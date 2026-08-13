import express from 'express'
import { errorHandler } from './middleware/error.middleware.js';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import morgan from 'morgan';

const app = express();


app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

// routes

app.use('/api/auth', authRouter)




// Global Error Handler
app.use(errorHandler)

export default app;
import express from 'express';
import "express-async-errors"; // needs to be imported before routers and other stuff!
import { profRouter } from './routes/prof';
import { themaRouter } from './routes/thema';
import { gebietRouter } from './routes/gebiet';
import { loginRouter } from './routes/login';
import cookieParser from 'cookie-parser';
import { configureCORS } from './configCORS';

const app = express();
configureCORS(app)
// Middleware:
app.use(cookieParser());
// Wozu wird diese Middleware benötigt?
app.use(express.json());

app.set("trust proxy", 1);


app.use('/api/prof', profRouter);
app.use('/api/thema', themaRouter);
app.use('/api/gebiet', gebietRouter);
app.use('/api/login', loginRouter);


// Routes
// Registrieren Sie hier die Router!


export default app;
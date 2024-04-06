import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN })); // for cross origin request
app.use(express.json({ limit: '50mb' })); // for parsing application/json
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // for parsing application/x-www-form-urlencoded
app.use(express.static('public')); // for serving static files 

app.use(cookieParser()); // for parsing cookies and do curd operation on cookies in user browser

export { app };
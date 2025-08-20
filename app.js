import express from "express";
import bodyParser from "body-parser";
import cors from 'cors';
import mongoose from "mongoose";
import connection from './db/connection.js';
import loginRouter from "./routes/login.route.js";
import clientRouter from "./routes/client.route.js";
import { fileURLToPath } from 'url'
// const path = require('path');
import path from 'node:path';
import userRouter from "./routes/user.route.js";
import reportRouter from "./routes/report.route.js";
import dashboardRouter from "./routes/dashboard.route.js";
import cron from 'node-cron';
import allRouter from "./routes/all.route.js";
import conversationDtsRouter from "./routes/conversationDetails.route.js";
import conversationNoteLogRouter from "./routes/conversationNoteLog.route.js";
import { AllClientConsuptionMinutesCronAction } from "./controllers/client.controller.js";
import callingSubscriptionRouter from "./routes/callingSubscription.route.js";



connection() 
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));
const app = express();
app.use(cors())
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())


app.use('/login',loginRouter)
app.use('/client',clientRouter)
app.use('/users',userRouter)
app.use('/report',reportRouter)
app.use('/dashboard',dashboardRouter)
app.use('/all',allRouter)
app.use('/conversation',conversationDtsRouter)
app.use('/conversation-log',conversationNoteLogRouter)
app.use('/calling-subscription',callingSubscriptionRouter)



// cron.schedule('59 23 * * *',AllClientConsuptionMinutesCronAction,{scheduled:true,timezone:"Asia/Kolkata"})


const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(__filename);

app.use('/images',express.static(path.join(_dirname,'/assets/uploads')))
app.use('/sample',express.static(path.join(_dirname,'/assets')))
app.use('/recording',express.static(path.join(_dirname,'/assets/recordings')))



const PORT = process.env.PORT || 9000;
const ip_address= "0.0.0.0"
app.listen(PORT,ip_address, () => {
  console.log(`Server is running on port ${PORT}`);
});
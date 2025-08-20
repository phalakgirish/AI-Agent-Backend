import express from 'express';
const dashboardRouter = express.Router();
import Auth from '../env/auth.js';
// import { getDashboardDetailsAction } from '../controllers/dashboard.controller.js';

// dashboardRouter.get('/', Auth, getDashboardDetailsAction);

export default dashboardRouter;
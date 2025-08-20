import express from 'express';
import { loginActionFunction } from '../controllers/login.controller.js';

const loginRouter = express.Router();

loginRouter.post('/',loginActionFunction);

export default loginRouter;

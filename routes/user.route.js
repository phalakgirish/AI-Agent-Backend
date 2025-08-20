import express from 'express';
const userRouter = express.Router();
import Auth from '../env/auth.js';
import { createAllUsers, updateUsersAction, updateUsersChangePasswordAction, updateUsersPasswordAction } from '../controllers/user.controller.js';

userRouter.get('/',Auth,createAllUsers);
userRouter.put('/all/:user_id',Auth,updateUsersAction);
userRouter.get('/changepassword/:user_id',Auth,updateUsersChangePasswordAction);
userRouter.put('/passwordchange/:user_id',Auth,updateUsersPasswordAction);


export default userRouter;
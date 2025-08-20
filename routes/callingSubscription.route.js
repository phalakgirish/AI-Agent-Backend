import express from 'express';
const callingSubscriptionRouter = express.Router();
import Auth from '../env/auth.js';
import { createClientSubAction, DeleteClientSubAction, getClientSubAction, getClientSubByIdAction, UpdateClientSubAction } from '../controllers/callingSubscription.controller.js';


callingSubscriptionRouter.post('/',Auth,createClientSubAction);
callingSubscriptionRouter.get('/:client_sub_id',Auth,getClientSubByIdAction);
callingSubscriptionRouter.get('/',Auth,getClientSubAction);
callingSubscriptionRouter.put('/:client_sub_id',Auth,UpdateClientSubAction);
callingSubscriptionRouter.delete('/:client_sub_id',Auth,DeleteClientSubAction);


export default callingSubscriptionRouter;
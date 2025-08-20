import express from 'express';
const conversationDtsRouter = express.Router();
import Auth from '../env/auth.js';
import APIAuth from '../env/apiAuth.js';

import { getAllConversationByFlowIdAction, getAllConversationSalesForceByFlowIdAction, getAllTodayConversationByFlowIdAction, getConversationByIdAction } from '../controllers/conversationDetails.controller.js';


conversationDtsRouter.get('/call/:conversationDts_id', Auth, getConversationByIdAction);
conversationDtsRouter.get('/', Auth, getAllConversationByFlowIdAction);
conversationDtsRouter.get('/all/todays', Auth,getAllTodayConversationByFlowIdAction);
conversationDtsRouter.get('/all/call/:client_id', APIAuth, getAllConversationSalesForceByFlowIdAction);




export default conversationDtsRouter;
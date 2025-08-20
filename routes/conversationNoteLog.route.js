import express from 'express';
const conversationNoteLogRouter = express.Router();
import Auth from '../env/auth.js';
import { createConversationNoteLogAction, getAllConversationNoteLogByConversationIdAction } from '../controllers/conversationNoteLog.controller.js';


conversationNoteLogRouter.get('/:conversation_id', Auth, getAllConversationNoteLogByConversationIdAction);
conversationNoteLogRouter.post('/', Auth, createConversationNoteLogAction);



export default conversationNoteLogRouter;
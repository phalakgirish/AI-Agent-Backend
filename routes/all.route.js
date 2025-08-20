import express from 'express';
const allRouter = express.Router();
import Auth from '../env/auth.js';
import { getCountriesAction,  getStatesByCountryAction, getTrascriptionAction, getTrascriptionPlivoAction } from '../controllers/all.controller.js';
import { AllClientConsuptionMinutesCronAction } from '../controllers/client.controller.js';


allRouter.get('/country', Auth, getCountriesAction);
allRouter.get('/state/:country', Auth, getStatesByCountryAction);
allRouter.get('/transcript/:call_uuid', Auth, getTrascriptionAction);
allRouter.post('/cdb-transcript', getTrascriptionPlivoAction);
allRouter.get('/sendemail/consumed', AllClientConsuptionMinutesCronAction);


export default allRouter;
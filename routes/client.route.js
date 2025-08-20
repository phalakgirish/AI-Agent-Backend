import express from 'express';
const clientRouter = express.Router();
import Auth from '../env/auth.js';
import { AllClientConsuptionMinutesAction, ClientConsuptionMinutesAction, ClientwiseSalesforceAPIDetailsAction, createClientAction, DeleteClientAction, getClientByIdAction, getClientsAction, ImportClientUploadAction, UpdateClientAction, verifyClientUploadAction, VerifyEmailAction } from '../controllers/client.controller.js';

clientRouter.post('/',Auth,createClientAction);
clientRouter.get('/:client_id',Auth,getClientByIdAction);
clientRouter.get('/',Auth,getClientsAction);
clientRouter.put('/:client_id',Auth,UpdateClientAction);
clientRouter.delete('/:client_id',Auth,DeleteClientAction);
// clientRouter.get('/verify/:emailid',Auth,VerifyEmailAction);
clientRouter.post('/verify-data',Auth,verifyClientUploadAction); // sip_maturity // sip_Management
clientRouter.post('/import-data',Auth,ImportClientUploadAction);
clientRouter.get('/all/client-consumption',Auth,AllClientConsuptionMinutesAction);
clientRouter.get('/all/clientwise/:client_id',Auth,ClientConsuptionMinutesAction);
clientRouter.get('/all/api/salesforce/:client_id',Auth,ClientwiseSalesforceAPIDetailsAction);





    
export default clientRouter;

// db.clients.updateMany({client_aadhaar_number:{$eq:null}},{$set:{client_aadhaar_number:null}})

// db.clients.updateMany({},{$set:{client_country:'India',client_state:'Maharashtra',client_city:''}})

// db.clients.updateMany({}, [{$set: {client_mobile_number: { $concat: ["+91-","$client_mobile_number"] }}}])

// db.clients.updateMany({},{$rename: { "client_pancard": "client_otherdocs" }});

// db.clients.updateMany({},{$set:{client_sip_refrence_family:false}})

// db.clients.updateMany({},{$set:{sip_reference_level:0}})

// sip_reference "681c6b039c1788b92170ce7a"
// payment_id "6718ac3aeacfd86c7470707f"


// shailendra sant's "670f679238f3dad7f7ffb6c3"



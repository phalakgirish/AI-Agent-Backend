import clientModel from '../models/client.model.js';
import mongoose from "mongoose";
import bcryptjs from 'bcryptjs';
import generator from 'generate-password'; 
import multer from 'multer';
import userModel from '../models/user.model.js';
import SendVerifyEmail, {SendEmail, SendReminderConsuptionEmail} from '../env/SendEmail.js';
import validator from "validator";
import conversationDetailsModel from '../models/conversationDetails.model.js';
import jwt from 'jsonwebtoken';
import callingSubscriptionModel from '../models/callingSubscription.model.js';

var salt = bcryptjs.genSaltSync(10);

const ObjectId = mongoose.Types.ObjectId;

const SECRET = 'asded785685asd';
const TIMESTAMP = 60*60*24;



var uniqueName = Date.now();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './assets/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, uniqueName+file.originalname);
    }
  })

//   const upload = multer({ storage: storage }).field(
//     { name: 'Client_logo', maxCount: 1 }, // Single file for 'profilePic' field   // Multiple files for 'documents' field
//   );

  const upload = multer({ storage: storage }).single('client_logo');

export const createClientAction = async (req, res) => {
    try
    {
        upload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                console.log(err);
            } else if (err) {
                // An unknown error occurred when uploading.
                console.log(err);
            } 
            else{
                // console.log(req.body);
                // return;
                
                const{client_name,client_emailId,client_role_type,client_isemailVerified,client_landline_number,client_authid,client_authtoken,client_answer_url,client_keywords,client_allocated_minutes} = req.body;

                
                var clientDetails = await clientModel.find();

                let ActualId = 0
                let NewClient_Id = ''
                if(clientDetails.length > 0)
                {
                    for(let val of clientDetails)
                    {
                        const splitNumbers = val.client_id.split('-').map((num) => parseFloat(num.trim()));
                        // console.log(splitNumbers);
                        if(splitNumbers[1] > ActualId)
                        {
                            ActualId = splitNumbers[1];
                        }
                    }
                }

                if(ActualId == 0)
                {
                    ActualId = 1001;
                    NewClient_Id = 'CL-'+ActualId.toString()
                }
                else
                {
                    ActualId = ActualId+1;
                    NewClient_Id = 'CL-'+ActualId.toString()
                }
                
                var client_DataToSave = {
                    client_id: NewClient_Id,
                    client_name: client_name,
                    client_emailId: client_emailId,
                    client_isemailVerified: client_isemailVerified,
                    client_role_type: client_role_type,
                    client_landline_number:client_landline_number.replace(/\s+/g, ''),
                    client_authid: client_authid,
                    client_authtoken: client_authtoken,
                    client_logo:(req.file == undefined || req.file == '') ? null : req.file.filename,
                    client_answer_url:client_answer_url,
                    client_keywords:client_keywords,
                    client_allocated_minutes:client_allocated_minutes
                }
                // console.log(staff_DataToSave);
                

                const client = new clientModel(client_DataToSave);
                await client.save();

                var password = generator.generate({ 
                    length: 8, 
                    numbers: true, 
                    symbols: true, 
                    uppercase: false, 
                    excludeSimilarCharacters: true, 
                    strict: true,     
                }); 

                var password_encrypt = bcryptjs.hashSync(password, salt);

                var user_DataToSave = {
                    user_emailId: client_emailId,
                    user_password: password_encrypt,
                    client_name: client_name,
                    user_role_type: client_role_type,
                    client_id: client._id,
                    user_status: true
                }

                const uses_data = new userModel(user_DataToSave);
                await uses_data.save();

                var usesCreatedData = {client_email_id:client_emailId,password:password}
                if(client_isemailVerified)
                {
                    // SendEmail(usesCreatedData.client_email_id,usesCreatedData.password)
                }

                res.status(201).json({ message: 'Client added successfully',status:true ,usesCreatedData:usesCreatedData});
                }
        });
     }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getClientByIdAction = async (req, res) => {
    try {
        // const staff = await staffModel.find(req.params.staff_id);
        var client = await clientModel.aggregate([
            {$match:{_id:new ObjectId(req.params.client_id)}},
          ])
        if (client.length == 0) {
            return res.status(404).json({ message: 'Client not found',status:false });
        }
        res.status(200).json({ client });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getClientsAction = async (req, res) => {
    try {
        // const staff = await staffModel.find();
        // const staff1 = await Shift.find();

        
        const pageNumber = req.query.page || 1;
        // const branch_id = req.query.branch_id || null;
        // console.log(branch_id);
        // branch_id = null
        const limit = req.query.limit || 20;
        const skip = req.query.offset || 0;
        var searchQuery = req.query.searchquery || '';
        var query = {}

        if(searchQuery != '')
        {
            query = {
                $or:[
                    {client_id:{ $regex: searchQuery, $options: 'i' }},
                    {client_name:{ $regex: searchQuery, $options: 'i' }},
                    {client_emailId:{ $regex: searchQuery, $options: 'i' }},
                    {client_landline_number:{ $regex: searchQuery, $options: 'i' }}
                ]
            }
        }

        var clientCount = await clientModel.find(query);
        var client = await clientModel.aggregate([
            {
                $lookup:{
                    from: "users",
                    localField: "_id",
                    foreignField: "client_id",
                    as: "users",
                 }
            },
            // {   $match:query    },
            // {   $skip:Number(skip)  },
            // {   $limit:Number(limit)    },
            {
                $project:{
                  _id:1,
                  client_id:1,
                  client_name: 1,
                  client_landline_number: 1,
                  client_emailId: 1,
                  client_status:{ $arrayElemAt: ["$users.user_status", 0] },
                //   AppointmentHistory:{
                //   _id:1,
                //   appointment_date_time:1,
                //   status_id:1,
                //   staff:{
                //     staff_name:1
                //     }
                //   }
                }
              }
        ])
        
        //.skip(skip).limit(limit)


        if (!client) {
            return res.status(404).json({ message: 'Client not found',status:false,clientCount:clientCount });
        }
        // console.log(staff1);
        res.status(200).json({ client,clientCount:clientCount.length });
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const DeleteClientAction = async (req, res) => {
    try {
        // const staff = await staffModel.find();
        // const staff1 = await Shift.find();
        var users = await userModel.deleteOne({client_id:new ObjectId(req.params.client_id)})


        var client = await clientModel.deleteOne({_id:new ObjectId(req.params.client_id)})
        res.status(201).json({ message: 'client deleted successfully',status:true, client,users });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const UpdateClientAction = async (req, res) => {
    try {

        upload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                console.log(err);
            } else if (err) {
                // An unknown error occurred when uploading.
                console.log(err);
            } 
            else{

                const{client_id,client_name,client_emailId,client_role_type,client_isemailVerified,client_landline_number,client_authid,client_authtoken,client_answer_url,client_keywords,client_allocated_minutes} = req.body;

                var client_record = await clientModel.findOne({_id:new ObjectId(req.params.client_id)});

                let clientLogo = client_record.client_logo
                

                if(req.file != undefined)
                {
                    clientLogo = req.file.filename
                }

                var client_DataToSave = {
                    client_id: client_id,
                    client_name: client_name,
                    client_emailId: client_emailId,
                    client_isemailVerified: client_isemailVerified,
                    client_role_type: client_role_type,
                    client_landline_number:client_landline_number.replace(/\s+/g, ''),
                    client_authid: client_authid,
                    client_authtoken: client_authtoken,
                    client_logo:clientLogo,
                    client_answer_url:client_answer_url,
                    client_keywords:client_keywords,
                    client_allocated_minutes:client_allocated_minutes
                }

                var user_DataToSave = {

                    user_emailId: client_emailId,
                    client_name: client_name,
                    user_role_type: client_role_type,
                }
                

                const users = await userModel.updateOne({client_id:new ObjectId(req.params.client_id)},user_DataToSave)
                const client = await clientModel.findByIdAndUpdate({_id:new ObjectId(req.params.client_id)},client_DataToSave);
                // await staff.save();
                res.status(201).json({ message: 'Client Updated successfully',status:true, client});  
        }})
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const VerifyEmailAction = async (req,res) => {
    try
    {
        const emailId = req.params.emailid
        const otp = Math.floor(1000 + Math.random() * 9000);

        await SendVerifyEmail(emailId, otp);

        res.status(200).send({ msg: "OTP generated successfully.", status: true, otp: otp });
    }
    catch(error)
    {
        res.status(400).json({error:error.message,status:false});
    }
}

export const verifyClientUploadAction = async (req,res)=>{ 
    try
    {
        for(let i in req.body)
        {
            // console.log(req.body[i]);
            
            const{client_name, client_emailId, client_landline_number,client_authid,client_authtoken,client_answer_url} = req.body[i];

            if(client_name == undefined || validator.isEmpty(client_name))
            {
                req.body[i].status= 0;
                req.body[i].msg="Name is required."
            }
            // else if(await VerifiedDuplicateClient(client_name))
            // {
                
            //     var clientDetails = await clientModel.aggregate([{$match:{client_name:{ $regex: client_name,$options:'i' }}}]);

            //     req.body[i].status= 0;
            //     req.body[i].msg=`Client will already exist on ${clientDetails[0].client_id} id with same name.`
            // }
            else if(client_emailId == undefined || validator.isEmpty(client_emailId))
            {   
                req.body[i].status= 0;
                req.body[i].msg="Email id is required."
            }
            else if(client_emailId == undefined || (!validator.isEmail(client_emailId)))
            {
                
                req.body[i].status= 0;
                req.body[i].msg="please enter valid email id."
            }
            else if(client_landline_number == undefined || validator.isEmpty(client_landline_number))
            {
                req.body[i].status= 0;
                req.body[i].msg="Landline number is required."
            }
            else if(client_authid == undefined || validator.isEmpty(client_authid))
            {
                req.body[i].status= 0;
                req.body[i].msg="Auth id is required."
            }
            else if(client_authtoken == undefined || validator.isEmpty(client_authtoken))
            {
                req.body[i].status= 0;
                req.body[i].msg="Auth token is required."
            }
            else if(client_answer_url == undefined || validator.isEmpty(client_answer_url))
            {
                req.body[i].status= 0;
                req.body[i].msg="Answer URL is required."
            }
            else
            {
                req.body[i].status=1;
                req.body[i].msg=""
            }
        }
        
        res.status(200).json({ message: 'Verification Action Called.',status:true, client:req.body });
    }
    catch(error)
    {
        res.status(400).json({ error: error.message });
    }
}

export const ImportClientUploadAction = async (req,res)=>{
    // console.log(req.body);
    
    try
    {
        for(let i in req.body)
        {
            const{client_name, client_emailId, client_landline_number,client_authid,client_authtoken,client_answer_url,client_allocated_minutes,status} = req.body[i];

            if(req.body[i]['status'] == 1)
            {
                var clientDetails = await clientModel.find();
                let ActualId = 0
                let NewClient_Id = ''
                if(clientDetails.length > 0)
                {
                    for(let val of clientDetails)
                    {
                        const splitNumbers = val.client_id.split('-').map((num) => parseFloat(num.trim()));
                        // console.log(splitNumbers);
                        if(splitNumbers[1] > ActualId)
                        {
                            ActualId = splitNumbers[1];
                        }
                    }
                }

                if(ActualId == 0)
                {
                    ActualId = 1001;
                    NewClient_Id = 'CL'+'-'+ActualId.toString()
                }
                else
                {
                    ActualId = ActualId+1;
                    NewClient_Id = 'CL'+'-'+ActualId.toString()
                }
                
                var client_DataToSave = {
                    client_id: NewClient_Id,
                    client_name: client_name,
                    client_emailId: client_emailId,
                    client_isemailVerified: false,
                    client_role_type: "1",
                    client_landline_number:client_landline_number.replace(/\s+/g, ''),
                    client_authid: client_authid,
                    client_authtoken: client_authtoken,
                    client_logo: null,
                    client_answer_url:client_answer_url,
                    client_keywords:'',
                    client_allocated_minutes:(client_allocated_minutes == undefined)?0:client_allocated_minutes
                }
        
                    
            
                // console.log('=========================================================');
                // console.log(userstoadd);
                    // console.log('=========================================================');
                // console.log(client_DataToSave);
                const client = new clientModel(client_DataToSave);
                await client.save();
                

                var password = generator.generate({ 
                    length: 8, 
                    numbers: true, 
                    symbols: true, 
                    uppercase: false, 
                    excludeSimilarCharacters: true, 
                    strict: true,     
                }); 

                var password_encrypt = bcryptjs.hashSync(password, salt);

                var user_DataToSave = {
                    user_emailId: client_emailId,
                    user_password: password_encrypt,
                    client_name: client_name,
                    user_role_type: "1",
                    client_id: client._id,
                    user_status: true
                }

                const uses_data = new userModel(user_DataToSave);
                await uses_data.save()
                

                    
                req.body[i].msg = `Record Added with Client Id ${NewClient_Id} and Password : ${password}.`
                    
            }
            else
            { 
                req.body[i].msg = "Record Not Added."  
            }
        }

        res.status(200).json({ message: 'Upload Action Called.',status:true, client:req.body });
    }
    catch(error)
    {
        res.status(400).json({ error: error.message });
    }
}

export const AllClientConsuptionMinutesAction = async (req,res)=>{
    // console.log(req.body);
    
    try
    {
        var clientDetails = await clientModel.find();
        var consumptionDetails = []
        for(let val of clientDetails)
        {

            var client_subscription_details = await callingSubscriptionModel.findOne({client_id:new ObjectId(val._id)}).sort({_id:-1});
            var client_allocated_minutes = 0
            var client_available_minutes = 0
            var totalConsumedduration = 0
            if(client_subscription_details != null)
            {
                var call_details = await conversationDetailsModel.aggregate([
                    {$match:{$and:[{client_id:new ObjectId(val._id)},{end_time:{$gte:client_subscription_details.client_subscription_date}}]}},
                    {
                        $group:{
                            _id: "$client_id",
                            // totalDuration: { $sum: "$call_duration" }
                            totalDuration:{ $sum:{ $ceil: { $divide: ["$call_duration", 60] } } }
                        }
                    }
                ])
                
                client_allocated_minutes = client_subscription_details.client_allocated_minutes
                client_available_minutes = client_subscription_details.client_available_minutes
                totalConsumedduration = (((call_details.length >0)?call_details[0].totalDuration:0)).toFixed(2)
            }
            

            var datatoInsert = {
                _id:val._id,
                client_id:val.client_id,
                client_name:val.client_name,
                client_allocated_minutes:(client_allocated_minutes == 0)?0:client_allocated_minutes,
                client_consumed_minutes:totalConsumedduration,
                client_total_avaialble_minutes:client_available_minutes,
                client_remaning_minutes:(client_available_minutes-totalConsumedduration).toFixed(2),
                client_consumed_per:((client_available_minutes == 0)?0:(totalConsumedduration/client_available_minutes)*100).toFixed(2)
            }

            consumptionDetails.push(datatoInsert)
        }

        res.status(200).json({ message: 'ConsumptionDetails.',status:true, client_consumptionDetails:consumptionDetails });
    }
    catch(error)
    {
        res.status(400).json({ error: error.message });
    }
}

export const ClientConsuptionMinutesAction = async (req,res)=>{
    // console.log(req.body);
    
    try
    {
        var clientId = req.params.client_id
        var clientDetails = await clientModel.findOne({_id:new ObjectId(clientId)});
        var client_subscription_details = await callingSubscriptionModel.findOne({client_id:new ObjectId(clientId)}).sort({_id:-1});
        var client_allocated_minutes = 0
        var client_available_minutes = 0
        var totalConsumedduration = 0
        var consumptionDetails = []
        if(client_subscription_details != null)
        {
            var call_details = await conversationDetailsModel.aggregate([
                {$match:{$and:[{client_id:new ObjectId(clientId)},{end_time:{$gte:client_subscription_details.client_subscription_date}}]}},
                {
                    $group:{
                        _id: "$client_id",
                        // totalDuration: { $sum: "$call_duration" }
                        totalDuration:{ $sum:{ $ceil: { $divide: ["$call_duration", 60] } } }
                    }
                }
            ])
            
            client_allocated_minutes = client_subscription_details.client_allocated_minutes
            client_available_minutes = client_subscription_details.client_available_minutes
            totalConsumedduration = (((call_details.length >0)?call_details[0].totalDuration:0)).toFixed(2)
        }

        var datatoInsert = {
                _id:clientDetails._id,
                client_id:clientDetails.client_id,
                client_name:clientDetails.client_name,
                client_allocated_minutes:(client_allocated_minutes == 0)?0:client_allocated_minutes,
                client_consumed_minutes:totalConsumedduration,
                client_total_avaialble_minutes:client_available_minutes,
                client_remaning_minutes:(client_available_minutes-totalConsumedduration).toFixed(2),
                client_consumed_per:((client_available_minutes == 0)?0:(totalConsumedduration/client_available_minutes)*100).toFixed(2)
        }
    
        res.status(200).json({ message: 'ConsumptionDetails.',status:true, client_consumptionDetails:datatoInsert });
    }
    catch(error)
    {
        res.status(400).json({ error: error.message });
    }
}

export const AllClientConsuptionMinutesCronAction = async (req,res)=>{
    // console.log(req.body);
    
    try
    {
        var clientDetails = await clientModel.find();
        var consumption90Details = []
        var consumption100Details = []

        for(let val of clientDetails)
        {
            var client_subscription_details = await callingSubscriptionModel.findOne({client_id:new ObjectId(val._id)}).sort({_id:-1});
            var call_details = await conversationDetailsModel.aggregate([
                {$match:{$and:[{client_id:new ObjectId(val._id)},{end_time:{$gte:client_subscription_details.client_subscription_date}}]}},
                {
                    $group:{
                        _id: "$client_id",
                        // totalDuration: { $sum: "$call_duration" }
                        totalDuration:{ $sum:{ $ceil: { $divide: ["$call_duration", 60] } } }
                    }
                }
            ])


            var totalConsumedduration = (((call_details.length >0)?call_details[0].totalDuration:0)).toFixed(2)

            var datatoInsert = {
                _id:val._id,
                client_id:val.client_id,
                client_name:val.client_name,
                client_allocated_minutes:(client_subscription_details.client_allocated_minutes == undefined)?0:client_subscription_details.client_allocated_minutes,
                client_consumed_minutes:totalConsumedduration,
                client_total_avaialble_minutes:client_subscription_details.client_available_minutes,
                client_remaning_minutes:(((client_subscription_details.client_available_minutes == undefined)?0:client_subscription_details.client_available_minutes)-totalConsumedduration).toFixed(2),
                client_consumed_per:((val.client_allocated_minutes == undefined)?0:(totalConsumedduration/client_subscription_details.client_available_minutes)*100).toFixed(2)
            }

            if(datatoInsert.client_consumed_per >= 90 && datatoInsert.client_consumed_per < 100)
            {
                consumption90Details.push(datatoInsert)
            }

            if(datatoInsert.client_consumed_per >= 100)
            {
                consumption100Details.push(datatoInsert)
            }

        }

        if(consumption90Details.length > 0)
        {
            SendReminderConsuptionEmail('creativebrain.co.in@gmail.com',consumption90Details,90)
        }

        if(consumption100Details.length > 0)
        {
            SendReminderConsuptionEmail('creativebrain.co.in@gmail.com',consumption100Details,100)
        }

        res.status(200).json({msg:'Cron JOB run Successfully.'})
        // res.status(200).json({ message: 'ConsumptionDetails.',status:true, client_consumptionDetails:consumptionDetails });
    }
    catch(error)
    {
        res.status(400).json({ error: error.message });
    }
}

export const ClientwiseSalesforceAPIDetailsAction = async (req,res)=>{
    // console.log(req.body);
    
    try
    {
        var clientId = req.params.client_id
        var client_details = await clientModel.findOne({_id:new ObjectId(clientId)})

        var clientDetails = {
            _id:client_details._id,
            client_id:client_details.client_id,
            client_name:client_details.client_name,
            client_answer_url:client_details.client_answer_url
        }

        var token_encrypt = bcryptjs.hashSync(JSON.stringify(clientDetails), salt);

        var tokenvalue = jwt.sign({
            data: token_encrypt,
        },SECRET,{expiresIn:60*60*24*365});


        res.status(200).json({msg:"Token Generated Successfully",status:true,token:tokenvalue});
        // res.status(200).json({ message: 'ConsumptionDetails.',status:true, client_consumptionDetails:consumptionDetails });
    }
    catch(error)
    {
        res.status(400).json({ error: error.message });
    }
}

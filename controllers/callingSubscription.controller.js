import clientModel from '../models/client.model.js';
import mongoose from "mongoose";
import bcryptjs from 'bcryptjs';
import generator from 'generate-password'; 
import multer from 'multer';
import userModel from '../models/user.model.js';
import validator from "validator";
import callingSubscriptionModel from '../models/callingSubscription.model.js';
import conversationDetailsModel from '../models/conversationDetails.model.js';

const ObjectId = mongoose.Types.ObjectId;

export const createClientSubAction = async (req, res) => {
    try
    {

        const{client_id,client_allocated_minutes,client_subscription_date,client_subscription_remarks} = req.body;

                
        var clientSubDetails = await callingSubscriptionModel.findOne().sort({_id:-1});
        
        let ActualId = 0
        let NewClientSub_Id = ''
        var available_minutes = 0
        if(clientSubDetails != null)
        {
            // for(let val of clientSubDetails)
            // {
                const splitNumbers = clientSubDetails.client_sub_id.split('-').map((num) => parseFloat(num.trim()));
                // console.log(splitNumbers);
                if(splitNumbers[1] > ActualId)
                {
                    ActualId = splitNumbers[1];
                }

                
            // }
        }

        var clients_sub_Details = await callingSubscriptionModel.findOne({client_id:new ObjectId(client_id)}).sort({_id:-1});
        if(clients_sub_Details != null)
        {
            available_minutes = await calculatePreviousAvailableMinutes(clients_sub_Details,client_subscription_date)
        }
        
        // return

        if(ActualId == 0)
        {
            ActualId = 1001;
            NewClientSub_Id = 'CLS-'+ActualId.toString()
        }
        else
        {
            ActualId = ActualId+1;
            NewClientSub_Id = 'CLS-'+ActualId.toString()
        }

        
                
        var client_DataToSave = {
            client_sub_id:NewClientSub_Id,
            client_id: client_id,
            client_allocated_minutes:client_allocated_minutes,
            client_available_minutes:client_allocated_minutes+available_minutes,
            client_subscription_date:client_subscription_date,
            client_subscription_remarks:client_subscription_remarks
        }
        // console.log(staff_DataToSave);
                

        const client_sub = new callingSubscriptionModel(client_DataToSave);
        await client_sub.save();

        res.status(201).json({ message: 'Client subscription added successfully',status:true ,client_sub:client_sub});
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getClientSubByIdAction = async (req, res) => {
    try {
        // const staff = await staffModel.find(req.params.staff_id);
        var client_sub = await callingSubscriptionModel.findOne({_id:new ObjectId(req.params.client_sub_id)})
        
        if (client_sub == null) {
            return res.status(404).json({ message: 'Client Subscription not found',status:false });
        }
        res.status(200).json({ client_sub });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getClientSubAction = async (req, res) => {
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

        // var clientCount = await callingSubscriptionModel.find(query);
        var client_sub = await callingSubscriptionModel.aggregate([
            {
                $lookup:{
                    from: "clients",
                    localField: "client_id",
                    foreignField: "_id",
                    as: "client",
                 }
            },
            // {   $match:query    },
            // {   $skip:Number(skip)  },
            // {   $limit:Number(limit)    },
            {
                $project:{
                    _id:1,
                    client_sub_id:1,
                    client_allocated_minutes:1,
                    client_subscription_date:1,
                    client_subscription_remarks:1,
                    client: { $arrayElemAt: ["$client", 0] },
                }
              }
        ])
        
        //.skip(skip).limit(limit)


        if (!client_sub) {
            return res.status(404).json({ message: 'Client Subscription not found',status:false });
        }
        // console.log(staff1);
        res.status(200).json({ client_sub,clientSubCount:client_sub.length });
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    } 
};

export const DeleteClientSubAction = async (req, res) => {
    try {

        var client_sub = await callingSubscriptionModel.deleteOne({_id:new ObjectId(req.params.client_sub_id)})
        res.status(201).json({ message: 'client subscription deleted successfully',status:true, client_sub });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const UpdateClientSubAction = async (req, res) => {
    try {


        const{client_sub_id,client_id,client_allocated_minutes,client_subscription_date,client_subscription_remarks} = req.body;
        var available_minutes = 0;
        var clients_sub_Details = await callingSubscriptionModel.findOne({$and:[{client_id:new ObjectId(client_id)},{_id:{$ne:new ObjectId(req.params.client_sub_id)}},{client_subscription_date:{$lt:client_subscription_date}}]}).sort({_id:-1});
        if(clients_sub_Details != null)
        {
            available_minutes = await calculatePreviousAvailableMinutes(clients_sub_Details,client_subscription_date)
        }

        var client_DataToSave = {
            client_sub_id:client_sub_id,
            client_id: client_id,
            client_allocated_minutes:client_allocated_minutes,
            client_available_minutes:client_allocated_minutes+available_minutes,
            client_subscription_date:client_subscription_date,
            client_subscription_remarks:client_subscription_remarks
        }
        
        const client_sub = await callingSubscriptionModel.findByIdAndUpdate({_id:new ObjectId(req.params.client_sub_id)},client_DataToSave);
        res.status(201).json({ message: 'Client Subscription Updated successfully',status:true, client_sub});  

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const calculatePreviousAvailableMinutes = async (previousData,client_subscription_date)=>{

    
    var call_details = await conversationDetailsModel.aggregate([
            {$match:{$and:[{client_id:new ObjectId(previousData.client_id)},{end_time:{$gte:previousData.client_subscription_date,$lte:new Date(client_subscription_date)}}]}},
            {
                $group:{
                    _id: "$client_id",
                    // totalDuration: { $sum: "$call_duration" }
                    totalDuration:{ $sum:{ $ceil: { $divide: ["$call_duration", 60] } } }
                }
            }
    ]) 
    

    var totalConsumedduration = (((call_details.length >0)?call_details[0].totalDuration:0)).toFixed(2)

    var previous_available_min = previousData.client_available_minutes - totalConsumedduration

    return previous_available_min;


}
// import mongoose from "mongoose";
// import branchModel from "../models/branch.model.js";
// import sipPaymentModel from "../models/sipPayment.model.js";
// import sipMemberMgmtModel from "../models/sipManagerment.model.js";
// import luckyDrawModel from "../models/luckyDraw.model.js";
// import clientModel from "../models/client.model.js";
// import sipReferenceModel from "../models/sipReference.model.js";
// import cilentWalletModel from "../models/clientWallet.model.js";
// import referenceSchemePaymentModel from "../models/referenceSchemePay.model.js";

// const ObjectId = mongoose.Types.ObjectId;

// export const getMonthWisePaymentAction = async (req,res)=>{
//     try{
        
//         const branchId = req.query.branchId;
//         const month = req.query.month
//         const sip_category = req.query.sipcategory;
//         const start_Date = req.query.startDate;
//         const end_Date = req.query.endDate;

//         var query = {}
//         var filter_field = []

//         if(month != '')
//         {
//             filter_field.push({sip_payment_month:month})
//         }
//         if(branchId != '0')
//         {
//             filter_field.push({branch_id:new ObjectId(branchId)})
//         }

//         if(start_Date != '' && end_Date != '')
//         {
//             var startDate = new Date(start_Date);

//             var endDate = new Date(end_Date);
            
//             filter_field.push({sip_payment_receivedDate:{$gte:startDate,$lte:getDateOfMonth(endDate,'End')}})   
//         }
        

//         if(filter_field.length >1)
//         {
//             query = {$and:filter_field}
//         }
//         else
//         {
//             for(let val of filter_field)
//             {
//                 query = val
//             }
            
//         }
        
        

        
//         let sipPayment
//         if(branchId == "0")
//         {
//             sipPayment = await sipPaymentModel.aggregate([
//                 {
//                     $lookup:{
//                         from: "sip_member_mgmts",
//                         localField: "sipmember_id",
//                         foreignField: "_id",
//                         as: "sip_id",
//                     }
//                 },
//                 {
//                     $lookup:{
//                         from: "staffs",
//                         localField: "sip_payment_receivedBy",
//                         foreignField: "_id",
//                         as: "receivedBy",
//                     }
//                 },
//                 {
//                     $lookup:{
//                         from:'branches',
//                         localField:'branch_id',
//                         foreignField:'_id',
//                         as:'branch'
//                     }
//                 },
//                 {
//                     $lookup:{
//                         from:'sip_categories',
//                         localField:'sip_id.sipmember_sip_category',
//                         foreignField:'_id',
//                         as:'sipCategory'
//                     }
//                 },

//                 {$match:query},
//                 {
//                     $project:{
//                         _id:1,
//                         sippayment_receiptno:1,
//                         Sip_id:{ $arrayElemAt: ["$sip_id.sipmember_id", 0] },
//                         sipmember_name:1,
//                         sip_payment_month: 1,
//                         sip_amount: 1,
//                         sip_penalty_month: 1,
//                         sip_penalty_amount: 1,
//                         sip_payment_mode: 1,
//                         sip_payment_refno: 1,
//                         sip_category_id:{ $arrayElemAt: ["$sip_id.sipmember_sip_category", 0] },
//                         sipmember_sip_category:{ $arrayElemAt: ["$sipCategory.sipcategory_name", 0] },
//                         sip_payment_receivedBy:{ $arrayElemAt: ["$receivedBy.staff_name", 0] },
//                         sip_payment_receivedDate:1,
//                         branch:{ $arrayElemAt: ["$branch.branch_name", 0] }
//                     }
//                 }
//             ])
//         }
//         else
//         {
//             sipPayment = await sipPaymentModel.aggregate([
//                 {
//                     $lookup:{
//                         from: "sip_member_mgmts",
//                         localField: "sipmember_id",
//                         foreignField: "_id",
//                         as: "sip_id",
//                     }
//                 },
//                 {
//                     $lookup:{
//                         from: "staffs",
//                         localField: "sip_payment_receivedBy",
//                         foreignField: "_id",
//                         as: "receivedBy",
//                     }
//                 },
//                 {
//                     $lookup:{
//                         from:'branches',
//                         localField:'branch_id',
//                         foreignField:'_id',
//                         as:'branch'
//                     }
//                 },
//                 {
//                     $lookup:{
//                         from:'sip_categories',
//                         localField:'sip_id.sipmember_sip_category',
//                         foreignField:'_id',
//                         as:'sipCategory'
//                     }
//                 },
//                 {$match:query},
//                 {
//                     $project:{
//                         _id:1,
//                         sippayment_receiptno:1,
//                         Sip_id:{ $arrayElemAt: ["$sip_id.sipmember_id", 0] },
//                         sipmember_name:1,
//                         sip_payment_month: 1,
//                         sip_amount: 1,
//                         sip_penalty_month: 1,
//                         sip_penalty_amount: 1,
//                         sip_payment_mode: 1,
//                         sip_payment_refno: 1,
//                         sip_category_id:{ $arrayElemAt: ["$sip_id.sipmember_sip_category", 0] },
//                         sipmember_sip_category:{ $arrayElemAt: ["$sipCategory.sipcategory_name", 0] },
//                         sip_payment_receivedBy:{ $arrayElemAt: ["$receivedBy.staff_name", 0] },
//                         sip_payment_receivedDate:1,
//                         branch:{ $arrayElemAt: ["$branch.branch_name", 0] }
//                     }
//                 }
//             ])
//         }

//         if(sip_category != '' && sipPayment.length> 0 )
//         {
//             // filter_field.push({"firstCustomer.sipmember_sip_category":new ObjectId(sip_category)})
//             sipPayment  = sipPayment.filter((item)=> item.sip_category_id == sip_category);
//         }

//         // console.log(sipPayment);
        

//         if (!sipPayment) {
//             return res.status(404).json({ message: 'Payment not found',status:false });
//         }

//         res.status(200).json({ sipPayment });
//     }
//     catch(error)
//     {
//         res.status(400).json({ error: error.message });
//     }
// }

// export const getSIPMemberWisePaymentAction = async (req,res)=>{
//     try{

//         // const branchId = req.query.branchId;
//         const sip_id = req.query.sip_id
        

//         var query = sip_id=='' ?{}:{ sipmember_id: new ObjectId(sip_id) };
//         let sipPayment = await sipPaymentModel.aggregate([
//                 {$match:query},
//                 {
//                     $lookup:{
//                         from: "sip_member_mgmts",
//                         localField: "sipmember_id",
//                         foreignField: "_id",
//                         as: "Sip_id",
//                     }
//                 },
//                 {
//                     $lookup:{
//                         from: "staffs",
//                         localField: "sip_payment_receivedBy",
//                         foreignField: "_id",
//                         as: "receivedBy",
//                     }
//                 },
//                 {
//                     $project:{
//                         _id:1,
//                         sippayment_receiptno:1,
//                         Sip_id:{ $arrayElemAt: ["$Sip_id.sipmember_id", 0] },
//                         sipmember_name:1,
//                         sip_payment_month: 1,
//                         sip_amount: 1,
//                         sip_penalty_month: 1,
//                         sip_penalty_amount: 1,
//                         sip_payment_mode: 1,
//                         sip_payment_refno: 1,
//                         sip_payment_receivedBy:{ $arrayElemAt: ["$receivedBy.staff_name", 0] },
//                         sip_payment_receivedDate:1
//                     }
//                 }
//             ])
        
        

//         if (!sipPayment) {
//             return res.status(404).json({ message: 'Payment not found',status:false });
//         }
//         // console.log(staff1);
//         res.status(200).json({ sipPayment });
//     }
//     catch(error)
//     {
//         res.status(400).json({ error: error.message });
//     }
// }

// export const getSIPMemberDetailsAction = async (req,res)=>{
//     try{

//         const branchId = req.query.branchId;
//         // const sip_id = req.query.sip_id
//         // console.log(branchId);
        

//         var query = branchId=='0' ?{}:{ branch_id: new ObjectId(branchId) };
//         let sipMemberDetails = await sipMemberMgmtModel.aggregate([
//                 {$match:query},
//                 {
//                     $lookup:{
//                         from: "clients",
//                         localField: "client_id",
//                         foreignField: "_id",
//                         as: "clients",
//                     }
//                 },
//                 {
//                     $lookup:{
//                         from: "sip_payments",
//                         localField: "_id",
//                         foreignField: "sipmember_id",
//                         as: "Sip_Payments",
//                     }
//                 },
//                 {
//                     $unwind: {
//                         path: "$Sip_Payments",    
//                         preserveNullAndEmptyArrays: true // Preserve documents without matching payment records
//                       }
//                     // preserveNullAndEmptyArrays: true
//                 },
//                 {
//                     $unwind: "$clients"
//                 },
//                 {
//                     $group:{
//                         _id:{
//                             sipmember_id: "$sipmember_id",
//                             client_id:"$clients.client_id",
//                             sipmember_name:"$sipmember_name",
//                             sipmember_doj:"$sipmember_doj",
//                             sipmember_maturity_date:"$sipmember_maturity_date"
//                         },
//                         totalSIPAmount:{$sum:{ $ifNull: ["$Sip_Payments.sip_amount", 0] }},
//                         totalSIPPenaltyAmount:{$sum:{ $ifNull: ["$Sip_Payments.sip_penalty_amount", 0] }},
//                     }
//                 },
//                 {
//                     $project:{
//                         // _id:0,
//                         sipmember_id:"$_id.sipmember_id",
//                         client_id:"$_id.client_id",
//                         sipmember_name:"$_id.sipmember_name",
//                         sipmember_doj:"$_id.sipmember_doj",
//                         sipmember_maturity_date:"$_id.sipmember_maturity_date",
//                         totalSIPAmount:1,
//                         totalSIPPenaltyAmount:1
//                     }
//                 },
//                 {
//                     $sort: { sipmember_id: 1 } // Sort by totalSIPAmount in descending order
//                 }
//             ])
        

            
//         if (!sipMemberDetails) {
//             return res.status(404).json({ message: 'SIP Member Not Found',status:false });
//         }
//         // console.log(staff1);
//         res.status(200).json({ sipMemberDetails });
//     }
//     catch(error)
//     {
//         res.status(400).json({ error: error.message });
//     }
// }

// export const getLuckyDrawMemberDetailsAction = async (req,res)=>{
//     try{

//         const month = req.query.month

//         let sipMemberDetails = await sipMemberMgmtModel.aggregate([
//             {$match:{sipmember_status:'Continue'}},
//             {
//                 $lookup:{
//                     from: "clients",
//                     localField: "client_id",
//                     foreignField: "_id",
//                     as: "clients",
//                 }
//             },
//             {
//                 $lookup:{
//                     from:'branches',
//                     localField:'branch_id',
//                     foreignField:'_id',
//                     as:'branch'
//                 }
//             },
//             {
//                 $lookup:{
//                     from: "sip_payments",
//                     localField: "_id",
//                     foreignField: "sipmember_id",
//                     as: "Sip_Payments",
//                 }
//             },
//             {
//                 $lookup:{
//                     from: "sip_categories",
//                     localField: "sipmember_sip_category",
//                     foreignField: "_id",
//                     as: "Sip_Category",
//                 }
//             },
//             {
//                 $unwind: "$Sip_Payments"
//             },
//             {
//                 $unwind: "$clients"
//             },
//             {
//                 $unwind: "$branch"
//             },
//             {
//                 $unwind: "$Sip_Category"
//             },
            
//             {
//                 $group:{
//                     _id:{
//                         _id:"$_id",
//                         sipmember_id: "$sipmember_id",
//                         client_id:"$clients.client_id",
//                         client_city:"$clients.client_city",
//                         sipmember_name:"$sipmember_name",
//                         sipmember_doj:"$sipmember_doj",
//                         sipmember_maturity_date:"$sipmember_maturity_date",
//                         sip_member_category:"$Sip_Category.sipcategory_name",
//                         branch:"$branch.branch_name"
//                     },
//                     totalSIPAmount:{$sum:"$Sip_Payments.sip_amount"},
//                     totalSIPPenaltyAmount:{$sum:"$Sip_Payments.sip_penalty_amount"},
//                     totalCount:{$sum:1}
//                 }
//             },
//             {
//                 $project:{
//                     _id:"$_id._id",
//                     Sip_id:"$_id.sipmember_id",
//                     client_id:"$_id.client_id",
//                     client_city:"$_id.client_city",
//                     sipmember_name:"$_id.sipmember_name",
//                     sipmember_doj:"$_id.sipmember_doj",
//                     sipmember_maturity_date:"$_id.sipmember_maturity_date",
//                     sip_member_category:"$_id.sip_member_category",
//                     branch:"$_id.branch",
//                     totalSIPAmount:1,
//                     totalSIPPenaltyAmount:1,
//                     totalCount:1
//                 }
//             },
//             {
//                 $sort: { sipmember_id: 1 } // Sort by totalSIPAmount in descending order
//             }
//         ]).sort({_id:1})
//         let sipPayment = []
//         // console.log(sipMemberDetails);

//         for(let val of sipMemberDetails)
//         {
//             const sipPaymentDetails = await sipPaymentModel.find({sipmember_id:new ObjectId(val._id)})

//             const luckdarwDetails = await luckyDrawModel.find({spimember_id:new ObjectId(val._id)})

//             const previousrank = luckdarwDetails.map((val)=> getOrdinal(parseInt(val.luckydraw_rank))).join(', ')

//             let SipMonthPaymnt = sipPaymentDetails.filter((item)=> item.sip_payment_month == month)

//             if(SipMonthPaymnt.length > 0)
//             {
//                 val['sip_amount'] = SipMonthPaymnt[0].sip_amount; 
//                 val['sip_payment_mode'] = SipMonthPaymnt[0].sip_payment_mode;
//                 val['sip_payment_month'] = formatMonthDate(SipMonthPaymnt[0].sip_payment_month);
//                 val['Sip_previous_rank'] = previousrank
//                 sipPayment.push(val)
//                 continue;
//             }
//             else if(val.totalCount >= 25)
//             {
//                 val['sip_amount'] = sipMemberDetails[sipMemberDetails.length -1].sip_amount;
//                 val['sip_payment_mode'] =  sipMemberDetails[sipMemberDetails.length -1].sip_payment_mode;
//                 val['sip_payment_month'] = formatMonthDate(SipMonthPaymnt[sipMemberDetails.length -1].sip_payment_month);  
//                 val['Sip_previous_rank'] = previousrank 
//                 sipPayment.push(val)
//                 continue;
//             }
//         }
        

//         if (!sipPayment) {
//             return res.status(404).json({ message: 'Payment not found',status:false });
//         }
//         // console.log(staff1);
//         res.status(200).json({ sipPayment });
//     }
//     catch(error)
//     {
//         res.status(400).json({ error: error.message });
//     }
// }

// export const getClientWiseCommisionDetailsAction = async (req,res)=>{
//     try{

//         // console.log(req.body);
        
//         var ReferedClient_id = []
//         var UpdatedClientId = []
        

        

//             // if(start_Date != '' && end_Date != '')
//             // {
//             //     var startDate = new Date(start_Date);
        
//             //     var endDate = new Date(end_Date);
                    
//             //     filter_field.push({"Sip_Payments.sip_payment_receivedDate":{$gte:startDate,$lte:getDateOfMonth(endDate,'End')}})   
//             // }

        

//         // console.log(query.$and[1]['Sip_Payments.sip_payment_receivedDate']);
        
        
//         ReferedClient_id.push({memberClientId:new ObjectId(req.body.client_id),start_Date:req.body.startDate,end_Date:req.body.endDate,level:0})
//         // console.log(staff1);
//         // res.status(200).json({ sipPayment });

//         ReferenceByLoop:
//         for(let val of ReferedClient_id)
//         {
 
//             // console.log(val);
            
//             var updatedClient_index = UpdatedClientId.indexOf(val)

//             if(updatedClient_index == -1)
//             {
                
//                 var samelevelCount = 0
                  
//                 // var client_referenceDetails = await sipReferenceModel.find({sip_refered_by: new ObjectId(val.memberClientId)})
//                 var client_referenceDetails = await sipReferenceModel.aggregate([
//                     {$match:{sip_refered_by: new ObjectId(val.memberClientId)}},
//                     {
//                         $group: {
//                           _id: "$sipmember_clientid",   // Group by client_id
//                           count: { $sum: 1 }   // Count occurrences
//                         }
//                     },
//                     {
//                         $project: {
//                           _id: 0,
//                           sipmember_clientid: "$_id"    // Rename _id to client_id
//                         }
//                     }
//                 ])




//                 for(let i of client_referenceDetails)
//                 {

//                     ReferedClient_id.push({memberClientId:i.sipmember_clientid,start_Date:req.body.startDate,end_Date:req.body.endDate,level:val.level+1})
//                 }


//                 UpdatedClientId.push(val)
//                 if(client_referenceDetails.length != 0)
//                 {
//                     // var client_reference_details = await sipReferenceModel.findOne({$and:[{sipmember_clientid:new ObjectId(val.referedbyclientId)},{sip_refered_by:new ObjectId(ReferedByClient_Id.sip_refered_by_clientId)}]}).sort({_id:-1});

//                     // ReferedClient_id.push({referedbyclientId:ReferedByClient_Id.sip_refered_by_clientId,comissionType:client_reference_details.comission_type,level:val.level+1})
                                       
//                         continue ReferenceByLoop; 
//                 }
//             }    
//         }  
//         // console.log(ReferedClient_id);
        
//         var CommissionDetails = []

//         for(let val of ReferedClient_id)
//         {
//             var query = {}
//             var queryWallet = {}
//             var queryClientWallet = {}


//             var filter_field = []
//             var filter_fieldWallet = []
//             var filter_clientfieldWallet = []



//             filter_field.push({client_id:new ObjectId(val.memberClientId)})
//             filter_fieldWallet.push({client_id:new ObjectId(val.memberClientId)},{wallet_credit_lock:false})
//             filter_clientfieldWallet.push({client_id:new ObjectId(req.body.client_id)},{paymentbyclient_id:new ObjectId(val.memberClientId)},{wallet_credit_lock:false})



//             if(val.start_Date != '' && val.end_Date != '')
//             {
//                 var startDate = new Date(val.start_Date);
        
//                 var endDate = new Date(val.end_Date);
                    
//                 filter_field.push({"Sip_Payments.sip_payment_receivedDate":{$gte:startDate,$lte:getDateOfMonth(endDate,'End')}}) 
//                 filter_fieldWallet.push({wallet_trans_date:{$gte:startDate,$lte:getDateOfMonth(endDate,'End')}}) 
//                 filter_clientfieldWallet.push({wallet_trans_date:{$gte:startDate,$lte:getDateOfMonth(endDate,'End')}})  

//             }

//             if(filter_field.length > 1)
//             {
//                 query = {$and:filter_field}
//             }
//             else
//             {
//                 for(let val of filter_field)
//                 {
//                     query = val;
//                 }      
//             }
//             queryWallet = {$and:filter_fieldWallet}
//             // console.log(queryWallet);
//             queryClientWallet = {$and:filter_clientfieldWallet}
            
//             var ReferedByClient_Id = await clientModel.findOne({_id: new ObjectId(val.memberClientId)})
//             .populate('sip_refered_by_clientId','client_id client_name')
            
//             var sipDetails = await sipMemberMgmtModel.findOne({client_id:new ObjectId(val.memberClientId)}).sort({_id:1}).limit(1)

//             let sipMemberDetails = await sipMemberMgmtModel.aggregate([
                
//                 {
//                     $lookup:{
//                         from: "sip_payments",
//                         localField: "_id",
//                         foreignField: "sipmember_id",
//                         as: "Sip_Payments",
//                     }
//                 },
//                 {
//                     $unwind: {
//                         path: "$Sip_Payments",    
//                         preserveNullAndEmptyArrays: true // Preserve documents without matching payment records
//                       }
//                     // preserveNullAndEmptyArrays: true
//                 },
//                 {$match:query},
//                 {
//                     $group:{
//                         _id:{
//                             client_id: "$client_id",
//                         },
//                         totalSIPAmount:{$sum:{ $ifNull: ["$Sip_Payments.sip_amount", 0] }},
//                         totalSIPPenaltyAmount:{$sum:{ $ifNull: ["$Sip_Payments.sip_penalty_amount", 0] }},
//                     }
//                 },
//                 {
//                     $project:{
//                         _id:0,
//                         client_id:"$_id.client_id",
//                         totalSIPAmount:1,
//                         totalSIPPenaltyAmount:1
//                     }
//                 }
//             ])

//             var clientWalletDetails = await cilentWalletModel.aggregate([
//                 {$match:queryWallet},
//                 {
//                     $group:{
//                         _id:{
//                             client_id:"$client_id",
//                             wallet_trans_type:"$wallet_trans_type"
//                         },
//                     totalCredit:{$sum:{ $ifNull: ["$wallet_credit", 0] }}
//                     }
//                 },
//                 {
//                     $project:{
//                         _id:0,
//                         client_id:"$_id.client_id",
//                         wallet_trans_type:"$_id.wallet_trans_type",
//                         totalCredit:1,
//                     }
//                 }
//             ])

//             // console.log(sipDetails);
//             // console.log(ReferedByClient_Id);
//             // console.log(sipMemberDetails);
//             // console.log(clientWalletDetails);
//             // queryClientWallet
//             var paymentby_client = await cilentWalletModel.aggregate([
//                 {
//                     $lookup:{
//                         from: "sip_member_mgmts",
//                         localField: "sipmember_id",
//                         foreignField: "_id",
//                         as: "sipmember_dts",
//                     }
//                 },
//                 {
//                     $unwind: {
//                         path: "$sipmember_dts",    
//                         preserveNullAndEmptyArrays: true // Preserve documents without matching payment records
//                       }
//                     // preserveNullAndEmptyArrays: true
//                 },
//                 {$match:queryClientWallet},
//                 {
//                     $group:{
//                         _id:{
//                             client_id:"$paymentbyclient_id",
//                             wallet_trans_type:"$wallet_trans_type"
//                         },
//                     totalCredit:{$sum:{ $ifNull: ["$wallet_credit", 0] }},
//                     sipId_array:{$addToSet:"$sipmember_dts.sipmember_id"}
//                     }
//                 },
//                 {
//                     $project:{
//                         _id:0,
//                         paymentby_client:"$_id.client_id",
//                         wallet_trans_type:"$_id.wallet_trans_type",
//                         totalCredit:1,
//                         sipIdlist:{
//                             $reduce:{
//                                 input:"$sipId_array",
//                                 initialValue:"",
//                                 in: {
//                                     $cond: [
//                                       { $eq: ["$$value", ""] },
//                                       "$$this",
//                                       { $concat: ["$$value", ",", "$$this"] }
//                                     ]
//                                 }
//                             }
//                         }
//                     }
//                 }
//             ])
            
            
//             var spot_commission = clientWalletDetails.filter((item)=>item.wallet_trans_type == 'Spot')
//             var recurring_commission = clientWalletDetails.filter((item)=>item.wallet_trans_type == 'Recurring')
//             var spot_commission_dts = paymentby_client.filter((item)=>item.wallet_trans_type == 'Spot')
//             var recurring_commission_dts = paymentby_client.filter((item)=>item.wallet_trans_type == 'Recurring')

//             var todayDate = new Date()
//             var comissionClientDetails = {
//                 _id:ReferedByClient_Id._id,
//                 client_id:ReferedByClient_Id.client_id,
//                 client_name:ReferedByClient_Id.client_name,
//                 generation:val.level,
//                 referredClient_id:(ReferedByClient_Id.sip_refered_by_clientId == null)?'':ReferedByClient_Id.sip_refered_by_clientId._id,
//                 referred_client_id:(ReferedByClient_Id.sip_refered_by_clientId == null)?'':ReferedByClient_Id.sip_refered_by_clientId.client_id,
//                 referred_client_name:(ReferedByClient_Id.sip_refered_by_clientId == null)?'':ReferedByClient_Id.sip_refered_by_clientId.client_name,
//                 total_invested_amount:(sipMemberDetails.length == 0)?0:sipMemberDetails[0].totalSIPAmount,
//                 spot_commission_dts:(spot_commission_dts.length == 0)?'':spot_commission_dts[0].sipIdlist,
//                 total_spot_commission_dts:(spot_commission_dts.length == 0)?0:spot_commission_dts[0].totalCredit,
//                 total_spot_commission:(spot_commission.length == 0)?0:spot_commission[0].totalCredit,
//                 recurring_commission_dts:(recurring_commission_dts.length == 0)?'':recurring_commission_dts[0].sipIdlist,
//                 total_recurring_commission_dts:(recurring_commission_dts.length == 0)?0:recurring_commission_dts[0].totalCredit,
//                 total_recurring_commission:(recurring_commission == 0)?0:recurring_commission[0].totalCredit,
//                 sipJoinDate:ReferedByClient_Id.createdAt,
//                 months:calculateMonthDiff(ReferedByClient_Id.createdAt,todayDate)
//             }
            
//             CommissionDetails.push(comissionClientDetails)

//         }

//         const clientMap = CommissionDetails.reduce((map, client,index) => {
//             var clientDTs = {id:index+1,text:`${client.client_id}, ${client.client_name}, ${formatDate(client.sipJoinDate)}, ${client.months}, ${client.total_invested_amount}, ${client.total_spot_commission}, ${client.total_recurring_commission}`}
//             map[client._id] = { ...clientDTs, children: [] };
//             return map;
//         }, {});
    
//         // Build the hierarchical structure
//         let root = null;
    
//         CommissionDetails.forEach((client) => {
//             if (client.referredClient_id && client.generation > 0) {
//                 // Add client to its referrer's referred_clients array
//                 const referrer = clientMap[client.referredClient_id];
//                 if (referrer ) {
//                     referrer.children.push(clientMap[client._id]);
//                 }
//             } else {
//                 // Client with no referrer is the root
//                 root = clientMap[client._id];
//             }
//         });
    
//         // return root;
        

//         res.status(200).json({msg:'record found',CommissionDetails:CommissionDetails,treeView:root})
          
//     }
//     catch(error)
//     {
//         res.status(400).json({ error: error.message });
//     }
// }

// export const getClientSchemeExpireInOneMonthAction = async (req, res)=>{
//     try
//     {
//         var todayDate = new Date();
//         todayDate.setMinutes(todayDate.getMinutes()+330);
//         var fromDate = getDateOfMonth1(todayDate.toISOString(),'Start')
//         var toDate = getDateOfMonth1(todayDate.toISOString(),'End')

//         // console.log(fromDate,toDate);
        
//         var referenceSchemepayment_dts = await referenceSchemePaymentModel.aggregate([
//             {
//                 $lookup:{
//                     from: "clients",
//                     localField: "client_id",
//                     foreignField: "_id",
//                     as: "clients",
//                  }
//             },
//             {
//                 $lookup:{
//                     from: "reference_schemes",
//                     localField: "reference_scheme",
//                     foreignField: "_id",
//                     as: "reference_scheme",
//                  }
//             },
//             {$match:{ref_payment_expirationDate:{$gte:fromDate,$lte:toDate}}},
//             {
//                 $project:{
//                     client_id:{ $arrayElemAt: ["$clients.client_id", 0] },
//                     client_name:{ $arrayElemAt: ["$clients.client_name", 0] },
//                     reference_category:1,
//                     reference_scheme:{ $arrayElemAt: ["$reference_scheme.refScheme_name", 0] },
//                     ref_payment_expirationDate:1
//                 }
//             }
//         ])
//         // console.log(referenceSchemepayment_dts);
        
//         res.status(200).json({referenceSchemepayment_dts,status:true})
//     }
//     catch(error)
//     {
//         console.log(error);
        
//         res.status(404).json({error:error,status:false})
//     }

    
// }

// const formatMonthDate = (dateString)=> {
//     const [year, month] = dateString.split('-');
    
//     // Create a date object using the year and month
//     const date = new Date(`${year}-${month}-01`);
    
//     // Format the month to get the full month name
//     const options = { month: "long" };
//     const monthName = new Intl.DateTimeFormat('en-US',{ month: 'long' }).format(date);
    
//     return `${monthName}-${year}`;
// }

// const getOrdinal = (n)=> {
//     const s = ["th", "st", "nd", "rd"];
//     const v = n % 100;
//     return n + (s[(v - 20) % 10] || s[v] || s[0]);
// }

// const getDateOfMonth = (monthstr,pos)=>{

//     // const DateStr = monthstr.split('T');
//     // const [year, month, date] = DateStr[0].split('-').map(Number);
//     // let MonthDate = new
//     // Start date of the month
//     // if(pos == 'Start')
//     // {
//     //     MonthDate = new Date(year, month - 1, 1);
//     // }
//     // else
//     // {
//     //     MonthDate = new Date(year, month, 0);
//     // }
    
    
    
//     if(pos != 'Start')
//     {
//         monthstr.setHours(29,29,59,0)
//     }

//     return monthstr;
// }

// const  calculateMonthDiff = (startDate, endDate)=> {
//     const start = new Date(startDate);
//     const end = new Date(endDate);
  
//     const yearsDiff = end.getFullYear() - start.getFullYear();
//     const monthsDiff = end.getMonth() - start.getMonth();
  
//     // Calculate total months difference
//     const totalMonths = yearsDiff * 12 + monthsDiff;
  
//     return totalMonths;
//   }

// const formatDate = (date) => {
//     return date.toLocaleDateString('en-GB', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//     });
// }

// const getDateOfMonth1 = (monthstr,pos)=>{

//     const DateStr = monthstr.split('T');
//     const [year, month, date] = DateStr[0].split('-').map(Number);
//     let MonthDate
//     // Start date of the month
//     if(pos == 'Start')
//     {
//         MonthDate = new Date(year, month - 1, date);
//     }
//     else
//     {
//         MonthDate = new Date(year, month, date);
//     }
    
    
//     if(pos != 'Start')
//     {
//         MonthDate.setHours(29,29,59,0)
//     }
//     else
//     {
//         MonthDate.setMinutes(MonthDate.getMinutes()+330);
//     }
//     return MonthDate;
// }


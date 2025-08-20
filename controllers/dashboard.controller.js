import mongoose from "mongoose";
// import sipMemberMgmtModel from "../models/sipManagerment.model.js";

const ObjectId = mongoose.Types.ObjectId;

// export const getDashboardDetailsAction = async (req, res) => {
//     try {
//         var todayDate = new Date();
//         todayDate.setMinutes(todayDate.getMinutes()+330);
//         var fromDate = getDateOfMonth(todayDate.toISOString(),'Start')
//         var toDate = getDateOfMonth(todayDate.toISOString(),'End')

//         var allSIPMember = await sipMemberMgmtModel.find();
 
//         var sipThisMonthMember = await sipMemberMgmtModel.aggregate([
//             {$match:{sipmember_doj:{$gte:fromDate,$lte:toDate}}},
//           ]);
        
//         if (sipThisMonthMember.length == 0) {
//             return res.status(404).json({ message: 'Payment not found',status:false });
//         }
//         var thisMonthMemberPer = (sipThisMonthMember.length/allSIPMember.length)*100

//         res.status(200).json({ message:'Send',thisMemberCount:sipThisMonthMember.length,thisMonthMemberPer:Math.round(thisMonthMemberPer),totalSIPMember:allSIPMember.length });

//     } catch (error) {

//         res.status(400).json({ error: error.message });

//     }
// };

// const getDateOfMonth = (monthstr,pos)=>{

//     const DateStr = monthstr.split('T');
//     const [year, month, date] = DateStr[0].split('-').map(Number);
//     let MonthDate
//     // Start date of the month
//     if(pos == 'Start')
//     {
//         MonthDate = new Date(year, month - 1, 1);
//     }
//     else
//     {
//         MonthDate = new Date(year, month, 0);
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
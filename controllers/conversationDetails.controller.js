import mongoose from "mongoose";
import fs from 'fs';
import path from 'path';
// import { spawn } from 'child_process';
import multer from 'multer';
import { fileURLToPath } from 'url'
// import { Queue } from 'bullmq';
import conversationDetailsModel from "../models/conversationDetails.model.js";
import { SendEmail } from "../env/SendEmail.js";
import { pipeline } from 'stream';
import { promisify } from 'util';
import clientModel from "../models/client.model.js";
import nlp from 'compromise'
import nlpDates from "compromise-dates";
import * as chrono from 'chrono-node'
import url from "../env/env.js";
import bcryptjs from 'bcryptjs';
import { spawn,exec } from 'child_process';

import {
  parse,
  addWeeks,
  addDays,
  format,
  nextDay,
  isSaturday,
  isSunday,
  isValid,
} from 'date-fns';

var salt = bcryptjs.genSaltSync(10);

nlp.extend(nlpDates);

const ObjectId = mongoose.Types.ObjectId;

export const getConversationByIdAction = async (req,res) => {
    try
    {

        const conversationDts_id = req.params.conversationDts_id

        const conversation_details = await conversationDetailsModel.findOne({_id:new ObjectId(conversationDts_id)})

        if(!conversation_details)
        {
            res.status(404).json({msg:"Conversation Recording and transcription not found", status:false})
        }
        else
        {
            res.status(200).json({msg:"Conversation Recording and transcription found",conversation_details:conversation_details,status:true})
        }

        
    }
    catch(error)
    {
        res.status(400).json({error:error.message, status:false})
    }


}

export const getAllConversationByFlowIdAction = async (req,res) => {
    try
    {

        // const flow_uuid = req.params.flow_uuid
        // {flow_uuid:new ObjectId(flow_uuid)}

        const pageNumber = req.query.page || 1;
        const limit = req.query.limit || 20;
        const skip = req.query.offset || 0;
        var client_id = req.query.client_id || '';
        var to_number = req.query.to_number || '';
        const start_Date = req.query.startDate || '';
        const end_Date = req.query.endDate|| '';
        const call_lead = req.query.call_lead|| false;
        
        
        
        var query = {}
        var filter_field = []

        if(client_id != '')
        {
            // filter_field.push({client_id:{ $regex: client_id.replace(' ',''), $options: 'i' }})
            filter_field.push({client_id: new ObjectId(client_id)})

        }

        if(call_lead)
        {
            filter_field.push({call_lead: Boolean(call_lead)})
        }

        if(to_number != '')
        {
            filter_field.push({to_number:{ $regex: to_number.replace(' ',''), $options: 'i' }})
        }

        if(start_Date != '' && end_Date != '')
        {
            var startDate = new Date(start_Date);

            var endDate = new Date(end_Date);
            
            filter_field.push({end_time:{$gte:new Date(startDate),$lte:new Date(endDate)}})   
        }

        if(filter_field.length > 1)
        {
            query = {$and:filter_field}
        }
        else
        {
            for(let val of filter_field)
            {
                query = val
            }
            
        }

        

        var text =`[Customer] Hello?
[Ai_Agent] Hi Pravin Karande, I 'm Priya from Roswalt Zayon. We received your enqu iry about our ultra-luxury 4 BHK homes in Andheri Oshiwara — a ‘membership by invitation only’ project. Would you like to know more?
[Customer] Yes.
[Ai_Agent] Great! Just a quick one—are you into business or working somewhere?
[Customer] Working convey.
[Customer] Yes.
[Ai_Agent] Thanks for sharing. Our Roswalt Zayo n homes are luxurious4 BHKs priced at Rupees seven crore forty lacs including3 car parkings. Does that fit what yo u’re looking for?
[Ai_Agent] Perfect! Would you like to pla n a visit to our project site in Andheri Oshiwara to explore it in person?
[Customer] Yes.
[Ai_Agent] Lovely! When would you prefer to visit—any particular day and time that works for you?
[Customer] Friday at 04:30PM?
[Ai_Agent] That’s great! I’ve noted your visit for Friday at 4:30 PM. You’ll receive all
[Customer] Can you please, reschedule my visit on next
[Customer] Friday next week?
[Customer] At 04:30PM.
[Ai_Agent] That’s great! I’ve updated your vis it to next Friday at4:30 PM. You’ll receive all details and directions shortly on WhatsApp. Before I let you go, is there anything else you’d like to know about the project?
[Customer] This project is a red apple project.
[Ai_Agent] I understand you're a sking about the project details. To clarify, Rosw alt Zayon isn't referred to as the 'red apple project. ' It's an ultra-luxu ry 4 BHK project in Andheri Oshiwara. Would you like to kno w more about our project features or amenities?
[Customer] No. Not now.
 `  

        // const keywords = ['Schedule','visit','meeting','appointment'];
                    
        // Code Start
            const result = {
                category: 'Cold',
                appointments: [],
                followUpSuggestions: [],
            };
            if (!text) return result;
            const lower = text.toLowerCase();
            const hotKeywords = ['visit', 'appointment', 'meeting', 'schedule', 'plan', 'call me'];
            const isHot = hotKeywords.some(k => lower.includes(k));
            if (!isHot) return result;

            // result.category = 'Hot';

            // // Patterns and handlers
            const patterns = [
                // Pattern 1: today, tomorrow, next/this weekend
                {
                regex: /(today|tomorrow|next\s+weekend|this\s+weekend)\s+at\s+(\d{1,2})(:(\d{2}))?\s?(am|pm)/gi,
                handler: (match) => {
                    const type = match[1].toLowerCase();
                    const hour = parseInt(match[2], 10);
                    const minute = match[4] ? parseInt(match[4], 10) : 0;
                    const meridiem = match[5].toLowerCase();

                    let date = new Date();

                    if (type === 'tomorrow') {
                    date = addDays(date, 1);
                    } else if (type.includes('next weekend')) {
                    date = nextDay(addWeeks(date, 1), 6); // next Saturday
                    } else if (type.includes('this weekend')) {
                    if (!isSaturday(date) && !isSunday(date)) {
                        date = nextDay(date, 6);
                    }
                    }

                    let finalHour = hour;
                    if (meridiem === 'pm' && hour !== 12) finalHour += 12;
                    if (meridiem === 'am' && hour === 12) finalHour = 0;

                    date.setHours(finalHour, minute, 0, 0);
                    return { type: 'Appointment', value: format(date, 'yyyy-MM-dd HH:mm') };
                },
                },
                // Pattern 2: specific weekday, maybe "next week"
                {
                regex: /(next\s+week\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)[\s\S]{0,20}?(\d{1,2})(:(\d{2}))?\s?(am|pm)/gi,
                // regex: /(?:(next\s+week\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+next\s+week)[\s\S]{0,20}?(\d{1,2})(:(\d{2}))?\s?(am|pm)/gi,
                handler: (match) => {
                    // console.log(match);
                    // return
                    const isNextWeek = !!match[1];
                    const weekDays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
                    // const day = match[2].toLowerCase();
                    const day = weekDays.indexOf(match[2]);
                    const hour = parseInt(match[3], 10);
                    const minute = match[5] ? parseInt(match[5], 10) : 0;
                    const meridiem = match[6].toLowerCase();
                    
                    let date = new Date();
                    // console.log(isNextWeek,day, hour, minute, meridiem,date);
                    date = nextDay(date, day);
                    // console.log(isNextWeek,day, hour, minute, meridiem,date);
                    if (isNextWeek) {
                    date = addWeeks(date, 1);
                    }
                    

                    let finalHour = hour;
                    if (meridiem === 'pm' && hour !== 12) finalHour += 12;
                    if (meridiem === 'am' && hour === 12) finalHour = 0;

                    date.setHours(finalHour, minute, 0, 0);
                    return { type: 'Appointment', value: format(date, 'yyyy-MM-dd HH:mm') };
                },
                },
                {
                regex: /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+?(next\s+week\s+)[\s\S]{0,20}?(\d{1,2})(:(\d{2}))?\s?(am|pm)/gi,
                handler: (match) => {
                    // console.log(match);
                    // return
                    
                    const isNextWeek = !!match[2];
                    
                    const weekDays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
                    // const day = match[2].toLowerCase();
                    const day = weekDays.indexOf(match[1]);
                    const hour = parseInt(match[3], 10);
                    const minute = match[5] ? parseInt(match[5], 10) : 0;
                    const meridiem = match[6].toLowerCase();
                    
                    let date = new Date();
                    // console.log(isNextWeek,day, hour, minute, meridiem,date);
                    date = nextDay(date, day);
                    console.log(isNextWeek,day, hour, minute, meridiem,date);
                    if (isNextWeek) {
                    date = addWeeks(date, 1);
                    }
                    

                    let finalHour = hour;
                    if (meridiem === 'pm' && hour !== 12) finalHour += 12;
                    if (meridiem === 'am' && hour === 12) finalHour = 0;

                    date.setHours(finalHour, minute, 0, 0);
                    return { type: 'Appointment', value: format(date, 'yyyy-MM-dd HH:mm') };
                },
                },
                // Pattern 3: vague follow-up mentions like "after 15 days"
                {
                regex: /(after\s+(\d{1,2})\s+days|next\s+week(end)?|call\s+me\s+(later|next\s+week))/gi,
                handler: (match) => {
                    let daysToAdd = 0;

                    if (match[2]) {
                    daysToAdd = parseInt(match[2], 10); // "after 15 days"
                    } else if ((match[0].toLowerCase()).includes('next weekend')) {
                    daysToAdd = 7 + (6 - new Date().getDay()); // move to next Saturday
                    } else {
                    daysToAdd = 7; // assume generic next week
                    }

                    const futureDate = addDays(new Date(), daysToAdd);
                    return {
                    type: 'FollowUp',
                    value: format(futureDate, 'yyyy-MM-dd'),
                    note: match[0],
                    };
                },
                },
            ];

            for (const { regex, handler } of patterns) {
                // console.log(regex);
                
                const matches = text.matchAll(regex);
                
                for (const match of matches) {
                    // console.log(match);
                    
                const parsed = handler(match);
                // console.log(parsed);
                
                if (parsed?.type === 'Appointment') {
                    result.appointments.push(parsed.value);
                } else if (parsed?.type === 'FollowUp') {
                    result.followUpSuggestions.push({
                    expectedDate: parsed.value,
                    reason: parsed.note,
                    });
                }
                }
            }

            console.log(result);

            const sanitizedText = text.replace(/"/g, '\\"');

        //     exec(`python extract.date.py "${sanitizedText}"`, (err, stdout, stderr) => {
        //     if (err) {
        //         console.error("Python Error:", err);
        //         return;
        //     }

        //     try {
        //         const result = JSON.parse(stdout);
        //         if (result.date && result.time) {
        //             console.log("Extracted Date:", result.date);
        //             console.log("Extracted Time:", result.time);
        //         } else {
        //             console.log("No valid date/time found.");
        //         }
        //     } catch (e) {
        //         console.error("JSON Parsing Error:", e.message);
        //     }
        // });

        const __filename = fileURLToPath(import.meta.url);
        const _dirname = path.dirname(__filename);
        const py = spawn('C:\\Users\\PRAVIN\\AppData\\Local\\Programs\\Python\\Python313\\python.exe', [path.join(_dirname, 'extract_date.py'), text]);

        let output = '';
        let errorOutput = '';

        py.stdout.on('data', (data) => {
            output += data.toString();
        });

        py.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        py.on('close', (code) => {
            if (code !== 0 || errorOutput) {
                console.error('Python Error:', errorOutput || `Process exited with code ${code}`);
                return;
            }

            try {
                const results = JSON.parse(output.trim());
                if (results.length > 0) {
                    console.log("Extracted Dates & Times:");
                    results.forEach((r, i) => {
                        console.log(`${i + 1}. "${r.original}" → ${r.date} at ${r.time}`);
                    });
                } else {
                    console.log("No date/time found.");
                }
            } catch (err) {
                console.error("JSON parsing failed:", err.message);
            }
        });
            

        // Code End
        


        // const conversation_details = await conversationDetailsModel.find(query).sort({_id:-1}).skip(skip).limit(limit)
        const conversation_details = await conversationDetailsModel.aggregate([
            {
                $lookup:{
                    from: "conversation_note_logs",
                    let: { conversationId: "$_id" },
                    pipeline: [
                    { $match: { $expr: { $eq: ["$conversation_dts_id", "$$conversationId"] } } },
                    { $sort: { conversation_note_date: -1 } }  // sort by date descending
                    ],
                    as: "notelog"
                }
            },
            { $match:query },
            { $sort:{_id:-1}},
            { $skip: Number(skip)},
            { $limit: Number(limit)},
            {
                $project:{
                    _id:1,
                    to_number:1,
                    call_state:1,
                    initiation_time:1,
                    call_direction:1,
                    answer_time:1,
                    end_time:1,
                    call_duration:1,
                    call_uuid:1,
                    call_lead:1,
                    note:{ $ifNull: [
                            { $arrayElemAt: ["$notelog.conversation_note", 0] },
                            ''
                        ]
                    }
                }
            }

        ])

        const conversation_details_count = await conversationDetailsModel.find(query)

        if(!conversation_details)
        {
            res.status(404).json({msg:"Conversations not found", status:false})
        }
        else
        {
            res.status(200).json({msg:"Conversation found",conversation_details:conversation_details,conversation_details_count:conversation_details_count.length,status:true})
        }

        
    }
    catch(error)
    {
        res.status(400).json({error:error.message, status:false})
    }

}

export const getAllTodayConversationByFlowIdAction = async (req,res) => {
    try
    {

        // const flow_uuid = req.params.flow_uuid
        // {flow_uuid:new ObjectId(flow_uuid)}

        const pageNumber = req.query.page || 1;
        const limit = req.query.limit || 20;
        const skip = req.query.offset || 0;
        var client_id = req.query.client_id || '';
        var to_number = req.query.to_number || '';
        const start_Date = getTodayUTC('start');
        const end_Date = getTodayUTC('end');
        const call_lead = req.query.call_lead|| false;

        
        var query = {}
        var filter_field = []

        if(client_id != '')
        {
            // filter_field.push({from_number:{ $regex: from_number.replace(' ',''), $options: 'i' }})
            filter_field.push({client_id: new ObjectId(client_id)})
        }

        if(call_lead)
        {
            filter_field.push({call_lead: Boolean(call_lead)})
        }

        if(to_number != '')
        {
            filter_field.push({to_number:{ $regex: to_number.replace(' ',''), $options: 'i' }})
        }

        if(start_Date != '' && end_Date != '')
        {
            var startDate = `${start_Date}:00.000Z`;

            var endDate = `${end_Date}:59.000Z`;
            
            filter_field.push({end_time:{$gte:new Date(startDate),$lte:new Date(endDate)}})   
        }

        if(filter_field.length >1)
        {
            query = {$and:filter_field}
        }
        else
        {
            for(let val of filter_field)
            {
                query = val
            }
            
        }

        
        
        // const conversation_details = await conversationDetailsModel.find(query).sort({_id:-1}).skip(skip).limit(limit)
        const conversation_details = await conversationDetailsModel.aggregate([
            {
                $lookup:{
                    from: "conversation_note_logs",
                    let: { conversationId: "$_id" },
                    pipeline: [
                    { $match: { $expr: { $eq: ["$conversation_dts_id", "$$conversationId"] } } },
                    { $sort: { conversation_note_date: -1 } }  // sort by date descending
                    ],
                    as: "notelog"
                }
            },
            { $match: query },
            { $sort:{_id:-1}},
            { $skip: Number(skip)},
            { $limit: Number(limit)},
            {
                $project:{
                    _id:1,
                    to_number:1,
                    call_state:1,
                    initiation_time:1,
                    call_direction:1,
                    answer_time:1,
                    end_time:1,
                    call_duration:1,
                    call_uuid:1,
                    call_lead:1,
                    note:{ $ifNull: [
                            { $arrayElemAt: ["$notelog.conversation_note", 0] },
                            ''
                        ]
                    }
                }
            }

        ])

        const conversation_details_count = await conversationDetailsModel.find(query)

        

        if(!conversation_details)
        {
            res.status(404).json({msg:"Conversations not found", status:false})
        }
        else
        {
            res.status(200).json({msg:"Conversation found",conversation_details:conversation_details,conversation_details_count:conversation_details_count.length,status:true})
        }

        
    }
    catch(error)
    {
        res.status(400).json({error:error.message, status:false})
    }

}

export const getAllConversationSalesForceByFlowIdAction = async (req,res) => {
    try
    {

        // const flow_uuid = req.params.flow_uuid
        // {flow_uuid:new ObjectId(flow_uuid)}

        const pageNumber = req.query.page || 1;
        const limit = req.query.limit || 20;
        const skip = req.query.offset || 0;
        var client_id = req.params.client_id || '';
        var to_number = req.query.to_number || '';
        const start_Date = req.query.startDate || '';
        const end_Date = req.query.endDate|| '';
        const call_lead = req.query.call_lead|| false;
        const pagination = req.query.pagination || false
        
        
        var query = {}
        var filter_field = []

        if(client_id != '')
        {
            // filter_field.push({client_id:{ $regex: client_id.replace(' ',''), $options: 'i' }})
            filter_field.push({client_id: new ObjectId(client_id)})

        }

        if(call_lead)
        {
            filter_field.push({call_lead: Boolean(call_lead)})
        }

        if(to_number != '')
        {
            filter_field.push({to_number:{ $regex: to_number.replace(' ',''), $options: 'i' }})
        }

        if(start_Date != '' && end_Date != '')
        {
            var startDate = new Date(start_Date);

            var endDate = new Date(end_Date);
            
            filter_field.push({end_time:{$gte:new Date(startDate),$lte:new Date(endDate)}})   
        }

        if(filter_field.length > 1)
        {
            query = {$and:filter_field}
        }
        else
        {
            for(let val of filter_field)
            {
                query = val
            }   
        }


        // const conversation_details = await conversationDetailsModel.find(query).sort({_id:-1}).skip(skip).limit(limit)
        const api_path = `${url.servernodeapipath}/recording/`;
        
        const pipeline = [
            {
                $lookup:{
                    from: "conversation_note_logs",
                    let: { conversationId: "$_id" },
                    pipeline: [
                    { $match: { $expr: { $eq: ["$conversation_dts_id", "$$conversationId"] } } },
                    { $sort: { conversation_note_date: -1 } },  // sort by date descending
                    {
                        $project: {
                            _id: 0,
                            conversation_note: 1,
                            conversation_note_date: 1
                        }
                    }
                    ],
                    as: "notelog"
                }
            },
            { $match:query },
            { $sort:{_id:-1}},
            {
                $project:{
                    _id:0,
                    call_uuid:1,
                    to_number:1,
                    from_number:1,
                    flow_name:1,
                    call_state:1,
                    call_direction:1,
                    initiation_time:1,
                    answer_time:1,
                    end_time:1,
                    call_duration:1,
                    call_lead:1,
                    recording_url:{$cond:{
                        if:{
                            $or:[
                                { $eq: ["$recording_url",""]},
                                { $eq: ["$recording_url",null]}
                            ]
                        },
                        then:"",
                        else:{$concat:[api_path,"$recording_url"]}}
                    },
                    recording_duration:1,
                    transcription:{$cond:{
                        if:{
                            $or:[
                                { $eq: ["$transcription",""]},
                                { $eq: ["$transcription",null]},
                                { $eq: ["$transcription",undefined]}

                            ]
                        },
                        then:"",
                        else:{$concat:["$transcription"]}}
                    },
                    notelog :1,
                }
            }

        ]
        // $2a$10$b/vm92ef/ZVBL4jNCF90.eHqVI.LIZCMhx/uIdeaGgbZlIxe27yFy
        if(pagination == true)
        {
            pipeline.push({ $skip: Number(skip) }, { $limit: Number(limit) });
        }

        const conversation_details = await conversationDetailsModel.aggregate(pipeline)

        const conversation_details_count = await conversationDetailsModel.find(query)

        if(!conversation_details)
        {
            res.status(404).json({msg:"Conversations not found", status:false})
        }
        else
        {
            res.status(200).json({msg:"Conversation found",conversation_details:conversation_details,conversation_details_count:conversation_details_count.length,status:true})
        }

        
    }
    catch(error)
    {
        res.status(400).json({error:error.message, status:false})
    }

}


function getTodayUTC(pos) {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const time=(pos == 'start')?'00:00:00':'23:59:59';
    const istDate = new Date(`${year}-${month}-${day}T${time}+05:30`);

    // Convert to UTC ISO string
    const utcDateString = istDate.toISOString().slice(0, 16);
    return utcDateString;
}




// const lines = text.split('\n').filter(line => line.trim().startsWith('[Customer'));
        // console.log(lines);

        // const customerText = lines.map(line => line.trim())
        // console.log(customerText);

        // const matched = customerText.filter(line =>
        //     keywords.some(word => line.toLowerCase().includes(word.toLowerCase()))
        // );
        // console.log(matched);

        // const doc = nlp(customerText.join('\n'));
        // const dates = doc.dates().out('array');
        // const times = doc.times().out('array');
//         // const verbs = doc.verbs().out('array');

//         // console.log("Verbs:", doc.verbs().out('array'));
        // console.log("Dates:", doc.dates().out('array'));
        // console.log("Times:", doc.times().out('array'));

        // const parsedDate = chrono.parseDate(dates[dates.length -1] || text, new Date(), { forwardDate: true });
//         // const parsedTime = chrono.parseDate(times[times.length -1] || text, new Date(), { forwardDate: true });

        // const parsedDate = chrono.parse( text, new Date(), { forwardDate: true });
//         const parsedTime = chrono.parse(times[times.length -1] || text, new Date(), { forwardDate: true });
//         // console.log(parsedTime);
        // console.log(parsedDate);
        

        // console.log(parsedDate[parsedDate.length-1]);
        // const parsedSecond = parsedDate[parsedDate.length-1]
        // const secondDate = parsedSecond.start.date();
        // console.log(secondDate);
        
        // console.log("🔹 Detected Intent Verbs:", verbs);
        // console.log("📅 Detected Dates:", dates.map(d => d.text));
        // console.log("🕒 Detected Times:", times.map(t => t.text));
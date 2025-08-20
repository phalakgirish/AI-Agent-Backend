import mongoose from "mongoose";
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url'
// import conversationDetailsModel from "../models/conversationDetails.model.js";
import { pipeline } from 'stream';
import { promisify } from 'util';
import conversationNoteLogsModel from "../models/conversationNoteLog.model.js";
const ObjectId = mongoose.Types.ObjectId;

export const createConversationNoteLogAction = async (req, res) => {
    try
    {
       
        const{conversation_note,conversation_note_date,conversation_note_by,conversation_dts_id} = req.body;
                
        var note_DataToSave = {
            conversation_note:conversation_note,
            conversation_note_date:conversation_note_date,
            conversation_note_by:conversation_note_by,
            conversation_dts_id:conversation_dts_id
        }

        const conversation_note_log = new conversationNoteLogsModel(note_DataToSave);
        await conversation_note_log.save();

        res.status(200).json({ message: 'Note Added successfully',status:true ,conversation_note_log});
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};


export const getAllConversationNoteLogByConversationIdAction = async (req, res) => {
    try
    {
       
        var conversationId = req.params.conversation_id;

        const conversation_note_log = await conversationNoteLogsModel.aggregate([
            {
                $lookup:{
                    from: "clients",
                    localField: "conversation_note_by",
                    foreignField: "_id",
                    as: "loggedBy",
                }
            },
            {$match: {conversation_dts_id:new ObjectId(conversationId)}},
            {$sort:{_id:-1}},
            {
                $project:{
                    _id:1,
                    conversation_note:1,
                    conversation_note_date:1,
                    LoggedBy:{ $arrayElemAt: ["$loggedBy.client_name", 0] },
                    conversation_dts_id:1
                }
            }

        ])

        res.status(200).json({ message: 'Note Found',status:true ,conversation_note_log});
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};


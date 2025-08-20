import mongoose from "mongoose";

import countryModel from "../models/country.model.js";
import stateModel from "../models/state.model.js";
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
import conversationNoteLogsModel from "../models/conversationNoteLog.model.js";
import nlp from 'compromise'
import nlpDates from "compromise-dates";
import * as chrono from 'chrono-node'

const streamPipeline = promisify(pipeline);

const ObjectId = mongoose.Types.ObjectId;

var uniqueName = Date.now();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './assets/uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, uniqueName+file.originalname);
    }
  })

const upload = multer({ storage: storage,limits: { fileSize: 10000000 } }).single('client_recording');

export const getCountriesAction = async (req,res) => {
    try
    {
        var country = await countryModel.find();

        if(!country)
        {
            res.status(200).json({msg:'No country found',country:country,status:false});
        }

        res.status(200).json({msg:'Country Found',country:country,status:true})
    }
    catch(error)
    {
        res.status(400).json({error:error.message, status:false})
    }
}

export const getStatesByCountryAction = async (req,res) => {
    try
    {
        var country_name = req.params.country
        var states = await stateModel.find({state_country:country_name});

        if(!states)
        {
            res.status(200).json({msg:'No state found',states:states,status:false});
        }

        res.status(200).json({msg:'States Found',states:states,status:true})
    }
    catch(error)
    {
        res.status(400).json({error:error.message, status:false})
    }
}

export const getTrascriptionAction = async (req,res) => {
    try
    {
        // upload(req, res, async function (err) {
        //     if (err instanceof multer.MulterError) {
        //         // A Multer error occurred when uploading.
        //         console.log(err);
        //     } else if (err) {
        //         // An unknown error occurred when uploading.
        //         console.log(err);
        //     } 
        //     else{
        //         const file = req.file;
                
        //         if (!file) return res.status(400).send('No file uploaded');

        //         const filePath = path.resolve(file.path);

        //         // Run whisper CLI
        //     //     exec(`whisper "${filePath}" --model base --output_format txt`, (error, stdout, stderr) => {
        //     //         if (error) {
        //     //         console.error('Whisper error:', error);
        //     //         return res.status(500).send('Transcription failed');
        //     //         }
        //     //     // Read the generated .txt file
        //     //     const txtPath = filePath.replace(/\.[^/.]+$/, '') + '.txt';
        //     //     fs.readFile(txtPath, 'utf8', (err, data) => {
        //     //     if (err) return res.status(500).send('Transcript file not found');

        //     //     // Clean up files
        //     //     fs.unlinkSync(filePath);
        //     //     fs.unlinkSync(txtPath);

        //     //     // res.json({ text: data });
        //     //     res.status(200).json({msg:'States Found',text: data,status:true})
        //     //     })
        //     // })
        //     const __filename = fileURLToPath(import.meta.url);
        //     const _dirname = path.dirname(__filename); 
        //     // const filePath = path.join(_dirname, file.path);
        //     ///whisper_env/bin/python3
        //     const python = spawn('C:\\Users\\PRAVIN\\AppData\\Local\\Programs\\Python\\Python313\\python.exe', [path.join(_dirname, 'transcribe.py'), filePath]);

        //     let transcript = '';
        //     let errorOutput = '';
        //     python.stdout.on('data', (data) => {
        //         transcript += data.toString();
        //     });

        //     python.stderr.on('data', (data) => {
        //         errorOutput += data.toString();
        //     });

            
            
        //     python.on('close', (code) => {
        //         if (code === 0) {
        //             fs.unlink(filePath, (err) => {
        //                 if (err) {
        //                     // console.error('Error deleting file:', err);
        //                 }
        //                 // console.log('File deleted:', filePath);
        //             });
        //             res.json({ transcript });
        //         } else {
        //             console.error(errorOutput);
        //             res.status(500).send('Transcription failed');
        //         }
        //     });

        //     }})

        const call_uuid = req.params.call_uuid

        const conversation_details = await conversationDetailsModel.findOne({call_uuid:call_uuid})

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


export const getTrascriptionPlivoAction = async (req,res) => {
    try
    { 
        const conversation_details = req.body.data.object
        const conversationDts = await conversationDetailsModel.findOne({call_uuid:conversation_details.call_uuid})
        if(conversationDts == null)
        {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const recordingsDir = path.join(__dirname, '..', 'assets/recordings');
            if (!fs.existsSync(recordingsDir)) {
                fs.mkdirSync(recordingsDir);
            }

            const fileName = `${conversation_details.call_uuid}.mp3`
            // Full path with specific filename
            const savePath = path.join(recordingsDir, fileName);

            const response = await fetch(conversation_details.event_data.recording_url);

            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.statusText}`);
            }

            const fileStream = fs.createWriteStream(savePath);

            // await new Promise((resolve, reject) => {
            //     response.body.pipe(fileStream);
            //     response.body.on('error', reject);
            //     fileStream.on('finish', resolve);
            // });

            await streamPipeline(response.body,fileStream)

            const client_details = await clientModel.findOne({
                client_answer_url: { $regex: conversation_details.flow_uuid, $options: 'i' }, // 'i' for case-insensitive
            });

            var parsedDate = null;

            if(client_details.client_keywords != '')
            {
                const keywords = client_details.client_keywords.split(',');
            
                // const lines = conversation_details.event_data.transcription.split('\n').filter(line => line.trim());
                const lines = conversation_details.event_data.transcription.split('\n').filter(line => line.trim().startsWith('[Customer'));
                // console.log(lines);

                const customerText = lines.map(line => line.trim())
                // console.log(customerText);
                
                // const matched = lines.filter(line =>
                //     keywords.some(word => line.toLowerCase().includes(word.toLowerCase()))
                // );
                // console.log(matched);
                    
                const doc = nlp(customerText.join('\n'));
                const dates = doc.dates().out('array');
                const times = doc.times().out('array');
                // const verbs = doc.verbs().out('array');

                // console.log(dates);
                // console.log(times);

                
                if(dates.length > 0)
                {
                    // parsedDate = chrono.parseDate(dates[dates.length -1] || conversation_details.event_data.transcription, new Date(), { forwardDate: true });

                    const lastDate = chrono.parse( conversation_details.event_data.transcription, new Date(), { forwardDate: true });

                    const parsedLastDate = lastDate[lastDate.length-1]
                    parsedDate = parsedLastDate.start.date();
                }
                // console.log(parsedDate);
                
            }
            
            // console.log(parsedDate);
            
            // console.log("Verbs:", doc.verbs().out('array'));
            // console.log("Dates:", doc.dates().out('array'));
            // console.log("Times:", doc.times().out('array'));

            const call_details = await fetch(`https://api.plivo.com/v1/Account/${client_details.client_authid}/Call?call_uuid=${conversation_details.call_uuid}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Authorization': 'Basic ' + btoa(`${client_details.client_authid}:${client_details.client_authtoken}`),
                    },
                });

            const data = await call_details.json();
            
            var call_log_details = data.objects[0]

            if((call_log_details.to_number.includes('plivo')))
            {
                res.status(200).json({msg:"Plivo Triggred Call",code:200,status:true});
                return;
            }

            const dataToStore={
                call_uuid: conversation_details.call_uuid,
                conversation_id: conversation_details.conversation_id,
                conversation_url: conversation_details.conversation_url,
                recording_duration: conversation_details.event_data.recording_duration,
                recording_start_time:(conversation_details.event_data.recording_start_time).replace(' ','T')+'.000+00:00',
                recording_end_time:(conversation_details.event_data.recording_end_time).replace(' ','T')+'.000+00:00',
                recording_url: fileName,
                transcription: (conversation_details.event_data.transcription == '' || conversation_details.event_data.transcription == undefined)?'':conversation_details.event_data.transcription,
                event_name: conversation_details.event_name,
                flow_name: conversation_details.flow_name,
                flow_run_uuid: conversation_details.flow_run_uuid,
                flow_uuid: conversation_details.flow_uuid,
                node_name:conversation_details.node_name,
                conversion_Dts_date:(req.body.created_at).replace('Z',''),
                from_number:call_log_details.from_number,
                to_number:`+${call_log_details.to_number}`,
                initiation_time:(call_log_details.initiation_time).replace(' ','T'),
                answer_time:(call_log_details.answer_time).replace(' ','T'),
                end_time:(call_log_details.end_time).replace(' ','T'),
                call_direction:call_log_details.call_direction,
                call_duration:call_log_details.call_duration,
                call_state:call_log_details.call_state,
                call_leades:'',
                client_id:client_details._id,
                call_lead:(parsedDate == null)?false:true,
            }

            const conversation_data = new conversationDetailsModel(dataToStore);
            await conversation_data.save()
            // console.log(dataToStore);
            if(parsedDate != null)
            {
                var note_DataToSave = {
                    conversation_note:`Customer Schedule his visit on ${formatMonthDate(parsedDate,'UTC')}`,
                    conversation_note_date:(req.body.created_at).replace('Z',''),
                    conversation_note_by:null,
                    conversation_dts_id:conversation_data._id
                }
                
                const conversation_note_log = new conversationNoteLogsModel(note_DataToSave);
                await conversation_note_log.save();
            }
            
            

            res.status(200).json({msg:"Conversation Added Successfully",code:200,status:true})
        }
        // console.log(req);
        
        // SendEmail('pravinkarande681@gmail.com',req.body)
        
        
    }
    catch(error)
    {
        res.status(400).json({error:error.message, code:400, status:false})
    }
}

const formatMonthDate = (dateString,timezone)=> {

        const date = new Date(dateString);
        const adiustMinitues = (timezone == 'IST')?330:0
        date.setMinutes(date.getMinutes()+adiustMinitues);
        // Format components
        const day = String(date.getUTCDate()).padStart(2, '0');
        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const month = monthNames[date.getUTCMonth()];
        const year = date.getUTCFullYear();

        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');

        // Final formatted string
        const formatted = `${day}-${month}-${year} ${hours}:${minutes}`;
        return formatted;
}
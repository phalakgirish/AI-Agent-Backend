import mongoose from 'mongoose';
import clientModel from '../models/client.model.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/user.model.js';

const ObjectId = mongoose.Types.ObjectId;

const SECRET = 'asded785685asd';

export default async function APIAuth(req, res, next)
{
    try
    {
        if(req.headers.authorization !== undefined)
        {
            const token = req.headers.authorization.split(" ")[1];
            // console.log('Bearer ',token);
            if(token === 'null' || token == '' || token == undefined)
            {
                res.status(401).json({msg: "Authentication Failed!",code:401,status:false});
            }
            else
            {
                const decodeToken = await jwt.verify(token,SECRET);

                var decoded_token = await jwt.decode(token)

                var client_id = req.params.client_id
                // console.log(client_id);
                var user_details = await userModel.findOne({client_id:new ObjectId(client_id)})
                var client_details = await clientModel.findOne({_id:new ObjectId(client_id)})
                var clientDetails = {
                    _id:client_details._id,
                    client_id:client_details.client_id,
                    client_name:client_details.client_name,
                    client_answer_url:client_details.client_answer_url
                }

                var stringyfyObj = JSON.stringify(clientDetails)

                var ans_valid = bcryptjs.compareSync(stringyfyObj,decoded_token.data);
                if(user_details.user_status == true)
                {
                    if(ans_valid)
                    {
                        next();
                    }
                    else
                    {
                        res.status(401).json({msg: "Authentication Failed!",code:401,status:false});
                    }
                }
                else
                {
                    res.status(401).json({msg: "Authentication Failed!",code:401,status:false});
                }
                
                // console.log('log',decodeToken);
                 
            }
        }
        else
        {
            res.status(401).json({msg: "Authentication Token Missing",code:401,status:false});
        }
        

    }
    catch(err)
    {
        // console.log('test error: ' + err);
        res.status(401).json({msg: "Authentication Failed!", code:401,status:false});
    }
}


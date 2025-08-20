import jwt from 'jsonwebtoken';
import validator from 'validator'; 
import bcryptjs from 'bcryptjs';
import mongoose from "mongoose";
import userModel from '../models/user.model.js';
import clientModel from '../models/client.model.js';

const ObjectId = mongoose.Types.ObjectId;

const SECRET = 'asded785685asd';
const TIMESTAMP = 60*60*24;

export const loginActionFunction = async function(req,res){
    // console.log(req.body);

    try
    {
        var {user_emailid,user_password} = req.body;
        // console.log(req.body);
        
        var ans_username = await userModel.findOne({user_emailId:user_emailid});
        // console.log(ans_username);

        if(ans_username === null)
        {
            res.send({msg:"Client Email Id Not Found.",status:false});
        }
        else if(ans_username.user_status === false)
        {
            res.send({msg:"Client Email Id Is Inactive, Please Contact Administrator !!",status:false});
        }
        else
        {
            var ans_pass = bcryptjs.compareSync(user_password,ans_username['user_password']);

            if(ans_pass)
            {
                // console.log(branch_id);
                var client_dts = await clientModel.findOne({_id:new ObjectId(ans_username['client_id'])})

                var payload = {
                    _id:ans_username['_id'],
                    user_emailId:ans_username['user_emailId'],
                    user_role_type:ans_username['user_role_type'],
                    client_name:ans_username['client_name'],
                    user_status:ans_username['user_status'],
                    client_landline_number: client_dts['client_landline_number'],
                    client_authid: client_dts['client_authid'],
                    client_authtoken: client_dts['client_authtoken'],
                    client_logo:(client_dts['client_logo'] == undefined || client_dts['client_logo'] == null)?'':client_dts['client_logo'],
                    client_answer_url:(client_dts['client_answer_url'] == undefined || client_dts['client_answer_url'] == null)?'':client_dts['client_answer_url'],
                    client_flow_id:(client_dts['client_answer_url'] == undefined || client_dts['client_answer_url'] == null)?'':client_dts['client_answer_url'].split('flow/')[1],
                    client_id:client_dts['_id']
                };
                // console.log(payload);

                var tokenvalue = jwt.sign({
                    data: payload,
                },SECRET,{expiresIn:60*60*24});

                // console.log(tokenvalue);
                res.send({msg:"Proceed To Dashboard",status:true,token:tokenvalue});
            }
            else
            {
                res.send({msg:"Invalid User Email Id and Password",status:false})
            }
        }

    }
    catch(error)
    {
        console.log(error);
    }
}
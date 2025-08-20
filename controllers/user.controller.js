import mongoose from "mongoose";
import userModel from "../models/user.model.js";
import bcryptjs from 'bcryptjs';
import generator from 'generate-password'; 
import changePasswordSendEmail from "../env/ChangePasswordSendEmail.js";

var salt = bcryptjs.genSaltSync(10);

const ObjectId = mongoose.Types.ObjectId;

const SECRET = 'asded785685asd';



export const createAllUsers = async (req,res)=>{


    let users = await userModel.aggregate([
            {
                $lookup:{
                    from: "clients",
                    localField: "client_id",
                    foreignField: "_id",
                    as: "Clients",
                }
            },
            {
                $project:{
                    _id:1,
                    user_emailId: 1,
                    user_role_type: 1,
                    client_name: { $arrayElemAt: ["$Clients.client_name", 0] },
                    client_isemailVerified: { $arrayElemAt: ["$Clients.client_isemailVerified", 0]},
                    client_id: { $arrayElemAt: ["$Clients.client_id", 0]},
                    user_status: 1
                }
            }
        ])
        

    if (users.length == 0) {
        return res.status(404).json({ message: 'Users not found',status:false });
    }

    res.status(200).json({ users });
}

export const updateUsersAction = async (req,res)=>{

    const {user_status} = req.body;

    
    var users_id = req.params.user_id;
    var users = await userModel.updateOne({client_id:new ObjectId(users_id)},{$set:{user_status:user_status}})

    if (users.length == 0) {
        return res.status(404).json({ message: 'Client not found',status:false });
    }

    res.status(200).json({ message:'Client Updated Sucessfully',status:true });
}

export const updateUsersChangePasswordAction = async (req,res)=>{


    var users_id = req.params.user_id;
    var ans_username = await userModel.findOne({client_id:new ObjectId(users_id)});

    var password = generator.generate({ 
        length: 8, 
        numbers: true, 
        symbols: true, 
        uppercase: false, 
        excludeSimilarCharacters: true, 
        strict: true,     
    }); 

    var password_encrypt = bcryptjs.hashSync(password, salt);

    var users = await userModel.updateOne({client_id:new ObjectId(users_id)},{$set:{user_password:password_encrypt}})

    if (users.length == 0) {
        return res.status(404).json({ message: 'Client not found',status:false });
    }
    
    var usesCreatedData = {client_email_id:ans_username.user_emailId,password:password}
    // changePasswordSendEmail(usesCreatedData.client_email_id,usesCreatedData.password)
    res.status(200).json({ message:'Client Password Changed Sucessfully',status:true, usesCreatedData:usesCreatedData});
}

export const updateUsersPasswordAction = async (req,res)=>{

    try{
        
        const{user_oldpassword, user_newpassword, user_confirmpassword} = req.body;
        var users_id = req.params.user_id;
        var ans_username = await userModel.findOne({_id:new ObjectId(users_id)});

        var ans_pass = bcryptjs.compareSync(user_oldpassword,ans_username['user_password']);

        if(ans_pass)
        {
            var password_encrypt = bcryptjs.hashSync(user_confirmpassword, salt);

            var users = await userModel.updateOne({_id:new ObjectId(users_id)},{$set:{user_password:password_encrypt}})

            if (users.length == 0) {
                return res.status(404).json({ message: 'Client not found',status:false });
            }
            
            res.status(200).json({ message:'Client Password Changed Sucessfully',status:true });
        }
        else
        {
            res.status(400).json({message:'Old password is not match to existing password',status:false})
        }
    }
    catch(error)
    {
        res.status(401).json({error:error,status:false})
    }
    

    
}
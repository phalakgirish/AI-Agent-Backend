import jwt from 'jsonwebtoken';

const SECRET = 'asded785685asd';
const TIMESTAMP = 60*60*24;

export default async function Auth(req, res, next)
{
    try
    {
        if(req.headers.authorization !== undefined)
        {
            const token = req.headers.authorization.split(" ")[1];
            // console.log('Bearer ',token);
            if(token === 'null' || token == '')
            {
                res.status(401).json({msg: "Authentication Failed!",code:401,status:false});
            }
            else
            {
                const decodeToken = await jwt.verify(token,SECRET);
                // console.log('log',decodeToken);
                next(); 
            }
        }
        else
        {
            res.status(401).json({msg: "JWT Token Missing",code:401,status:false});
        }
        

    }
    catch(err)
    {
        // console.log('test error: ' + err);
        res.status(401).json({msg: "Token Expired", code:401,status:false});
    }
}


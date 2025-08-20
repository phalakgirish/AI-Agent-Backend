import mongoose from 'mongoose';

async function connection(){

    
    // return await mongoose.connect('mongodb://127.0.0.1:27017/cosmohub')

// return await mongoose.connect('mongodb+srv://admin:appointment123@native-app.1ajnrxb.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
return await mongoose.connect('mongodb+srv://pravinkarande2483:pravinkarande681@cluster0.namu5dc.mongodb.net/aiagent09062025')
// return await mongoose.connect('mongodb://root:CDBInfotech%402025@82.112.236.27:27017/aiagent')
// return await mongoose.connect('mongodb://admin:(Xv0PIB2acAShxw,%40yT&@93.127.194.185:27017/aiagent')


    //KzTWwM0bHm5n85Cc
}

export default connection;
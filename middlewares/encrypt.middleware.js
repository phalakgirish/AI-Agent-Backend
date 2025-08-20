import bcrypt from 'bcryptjs';
var salt = bcrypt.genSaltSync(10)

const encryptdata = (txtData) => {
    return bcrypt.hashSync(txtData, salt)
}


const comparedata = (dbPass,textPass) => {
    return bcrypt.compareSync(textPass,dbPass);
}

export {encryptdata,comparedata}
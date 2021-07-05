//import crypto  from 'crypto';
const crypto = require('crypto'); 

class userManager{
    public static genMd5password(passwd){
        return crypto.createHash('md5').update(passwd).digest('hex');
    }
    public static genCookie(){
        return crypto.randomBytes(16).toString('base64').slice(0, 16)
    }
}

export{
    userManager
}


 
   
import {config} from './config/conf';
import {configure, getLogger } from 'log4js';

let rootDIR=__dirname;

//logger config
configure({
    appenders: {
        file: {
            type: 'file',
            filename: rootDIR+"/../log/"+config.logfilename, 
            maxLogSize: 500000,
            backups: 5,
            replaceConsole: true,
        },
        console: {
            type: 'console',
            replaceConsole: true,
        },
    },
    
    categories: {
        default: { appenders: config.logtypes, level: config.loglevel },
    },
    
    disableClustering:true
});

let logger=getLogger('default');

///time
class Time {
    public static now(){
        return  Math.floor(Date.now() / 1000);
    }

    public static  sleep(ms) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
      }
}


 


export {
    rootDIR,
    logger,
    Time
}
    
    
 
      

 
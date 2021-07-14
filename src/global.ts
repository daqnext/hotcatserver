/*
 * @Author: your name
 * @Date: 2021-07-07 10:47:59
 * @LastEditTime: 2021-07-13 09:29:14
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/global.ts
 */
import { config } from "./config/conf";
import { configure, getLogger } from "log4js";
import moment from "moment";

let rootDIR = __dirname;

//logger config
configure({
  appenders: {
    file: {
      type: "file",
      filename: rootDIR + "/../log/" + config.logfilename,
      maxLogSize: 500000,
      backups: 5,
      replaceConsole: true,
    },
    console: {
      type: "console",
      replaceConsole: true,
    },
  },

  categories: {
    default: { appenders: config.logtypes, level: config.loglevel },
  },

  pm2: process.env.NODE_ENV === 'production', //if run with PM2 in production
  pm2InstanceVar: 'INSTANCE_ID',
  
  disableClustering: true,
});

let logger = getLogger("default");


export { rootDIR, logger };

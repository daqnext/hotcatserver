/*
 * @Author: your name
 * @Date: 2021-07-07 10:47:59
 * @LastEditTime: 2021-07-09 10:54:52
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

  disableClustering: true,
});

let logger = getLogger("default");


export { rootDIR, logger };

/*
 * @Author: your name
 * @Date: 2021-07-07 16:24:21
 * @LastEditTime: 2021-07-25 11:56:35
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/utils/logHelper.ts
 */
import log4js, { configure, getLogger } from 'log4js';
import path from 'path';
import { config } from '../config/conf';
import { logger } from '../global';
export class LogHelper {
    static logger
    private static logLevel = 'trace';
    private static logLevelDefine: any = {
        TRACE: 1,
        DEBUG: 2,
        INFO: 3,
        WARN: 4,
        ERROR: 5,
        FATAL: 6,
    };
    static Init() {
        
        LogHelper.logger = logger;

       

        // log4js.shutdown(
        //     function ()
        //     {
        //         LogHelper.info("Server Stop");
        //         LogHelper.info("");
        //     });

        //cover log debug ......
        console.log = function (message: any, ...args: any[]) {
            //logger level
            if (LogHelper.logLevelDefine[config.loglevel] > LogHelper.logLevelDefine.DEBUG) {
                return;
            }
            
            const stackInfoStr = LogHelper.stackInfo();
            const info = `[${stackInfoStr.file}:${stackInfoStr.line} (${stackInfoStr.method})]`;
            LogHelper.logger.debug(info, message, ...args);
        };
        console.debug = function (message: any, ...args: any[]) {
            if (LogHelper.logLevelDefine[config.loglevel] > LogHelper.logLevelDefine.DEBUG) {
                return;
            }
            const stackInfoStr = LogHelper.stackInfo();
            const info = `[${stackInfoStr.file}:${stackInfoStr.line} (${stackInfoStr.method})]`;
            LogHelper.logger.debug(info, message, ...args);
        };
        console.info = function (message: any, ...args: any[]) {
            if (LogHelper.logLevelDefine[config.loglevel] > LogHelper.logLevelDefine.INFO) {
                return;
            }
            const stackInfoStr = LogHelper.stackInfo();
            const info = `[${stackInfoStr.file}:${stackInfoStr.line} (${stackInfoStr.method})]`;
            LogHelper.logger.info(info, message, ...args);
        };
        console.warn = function (message: any, ...args: any[]) {
            if (LogHelper.logLevelDefine[config.loglevel] > LogHelper.logLevelDefine.WARN) {
                return;
            }
            const stackInfoStr = LogHelper.stackInfo();
            const info = `[${stackInfoStr.file}:${stackInfoStr.line} (${stackInfoStr.method})]`;
            LogHelper.logger.warn(info, message, ...args);
        };
        console.error = function (message: any, ...args: any[]) {
            if (LogHelper.logLevelDefine[config.loglevel] > LogHelper.logLevelDefine.ERROR) {
                return;
            }
            const stackInfoStr = LogHelper.stackInfo();
            const info = `[${stackInfoStr.file}:${stackInfoStr.line} (${stackInfoStr.method})]`;
            LogHelper.logger.error(info, message, ...args);
        };
       
    }

    
    private static stackInfo(num = 0) {
        const stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/i;
        const stackReg2 = /at\s+()(.*):(\d*):(\d*)/i;
        const err = new Error();
        const stacklist = err.stack.split('\n').slice(3);
        const s = stacklist[num];
        const sp = stackReg.exec(s) || stackReg2.exec(s);
        const data: any = {};
        if (sp && sp.length === 5) {
            data.method = sp[1];
            data.path = sp[2];
            data.line = sp[3];
            data.pos = sp[4];
            data.file = path.basename(data.path);
        }
        return data;
    }
}

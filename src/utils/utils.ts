/*
 * @Author: your name
 * @Date: 2021-07-07 15:17:23
 * @LastEditTime: 2021-07-08 11:56:37
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/utils/utils.ts
 */

const emailReg=/\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{1,14}/

export class Utils {
  static getRequestIP(req) {
    let ip =
      req.headers["x-forwarded-for"] || // 判断是否有反向代理 IP
      req.ip ||
      req.connection.remoteAddress || // 判断 connection 的远程 IP
      req.socket.remoteAddress || // 判断后端的 socket 的 IP
      req.connection.socket.remoteAddress ||
      "";
    if (ip) {
      ip = ip.replace("::ffff:", "");
    }
    return ip;
  }

  static isEmailLegal(email:string):boolean{
    if (!emailReg.test(email)) {
      return false
    }
    return true
  }
  
}

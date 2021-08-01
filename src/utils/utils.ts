/*
 * @Author: your name
 * @Date: 2021-07-07 15:17:23
 * @LastEditTime: 2021-08-01 19:08:24
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/utils/utils.ts
 */
import sizeOf from "image-size"
import cmd from "node-cmd"

const emailReg=/\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{1,14}/

class Utils {
  static instanceIp=""
  
  static getRequestIP(req) {
    let ip =
      req.headers['x-real-ip'] ||
      req.headers["x-forwarded-for"] || 
      req.ip ||
      req.connection.remoteAddress || 
      req.socket.remoteAddress ||
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

  static sizeOfImg(bufferOrPath:Buffer|string){
      try {
        const size=sizeOf(bufferOrPath)
        return size
      } catch (error) {
          console.log(error);
          return null
      }
  }

  static filterFileExt(ext:string,allowExt:string[]){
    const index=allowExt.indexOf(ext)
    if (index===-1) {
        return false
    }
    return true
  }

  static getInstanceIp(){
    if (Utils.instanceIp==="") {
      const result=cmd.runSync('curl http://instance-data/latest/meta-data/public-ipv4');
      if (result) {
        Utils.instanceIp=result.data
        console.info("instance ip:",Utils.instanceIp)
      }
    }
    return Utils.instanceIp
  }
  
}

export{Utils}

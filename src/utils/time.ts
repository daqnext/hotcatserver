/*
 * @Author: your name
 * @Date: 2021-07-09 10:54:26
 * @LastEditTime: 2021-07-12 15:17:28
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/utils/time.ts
 */
class Time {
    // public static now() {
    //   return Math.floor(Date.now() / 1000);
    // }
  
    public static sleep(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    }
  }

  export { Time }; 
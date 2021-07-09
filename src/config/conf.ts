/*
 * @Author: your name
 * @Date: 2021-07-07 10:47:59
 * @LastEditTime: 2021-07-09 09:03:55
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/config/conf.ts
 */
//default to dev config
let config=require('./dev_center_config');

if(process.argv.includes("dev_region_config")){
    config=require('./dev_region_config');
}

if(process.argv.includes("prod_config")){
    config=require('./prod_config');
}

export  {config};
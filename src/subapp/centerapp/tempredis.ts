/*
 * @Author: your name
 * @Date: 2021-07-28 10:14:33
 * @LastEditTime: 2021-07-28 10:25:45
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/subapp/centerapp/tempredis.ts
 */

import { redisTool } from "../../redis/redisTool"

async function redistool(){
    const ip=await redisTool.getSingleInstance().redis.get("ipRegionInfo_addr_34.85.203.212")

    console.log(ip);
    
}

redistool()
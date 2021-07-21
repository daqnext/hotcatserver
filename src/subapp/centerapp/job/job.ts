/*
 * @Author: your name
 * @Date: 2021-07-13 09:08:07
 * @LastEditTime: 2021-07-21 23:47:09
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/subapp/centerapp/job/job.ts
 */

import schedule from 'node-schedule';
import { ipRegionInfo } from '../../../manager/project/ipRegionInfo';
import { liveServerManager } from '../../../manager/project/liveServerManager';
import { livestreamManager } from '../../../manager/project/livestreamManager';

function InitJob(){
    ipRegionInfo.init()
    //area to region map
    ipRegionInfo.updateAreaToRegionMap()
    liveServerManager.updateLiveServerMap()

    //only 1 process
    livestreamManager.InitWatched()
}

function StartScheduleJob(){
    //update region and liveServer info every 10 mins
    schedule.scheduleJob("ScheduleUpdateRegionAndLiveServerInfo",'0 0/10 * * * *',async ()=>{
        await ipRegionInfo.updateAreaToRegionMap
        await liveServerManager.updateLiveServerMap
    })

    //only 1 process
    //update watched every 5 mins
    schedule.scheduleJob("ScheduleUpdateRegionAndLiveServerInfo",'5 0/5 * * * *',livestreamManager.ScheduleUpdateWatched)
}

export{InitJob,StartScheduleJob}
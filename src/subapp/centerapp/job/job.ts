/*
 * @Author: your name
 * @Date: 2021-07-13 09:08:07
 * @LastEditTime: 2021-08-05 10:43:11
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/subapp/centerapp/job/job.ts
 */

import schedule from "node-schedule";
import { config } from "../../../config/conf";
import { categoryManager } from "../../../manager/project/categoryManager";
import { ipRegionInfo } from "../../../manager/project/ipRegionInfo";
import { languageManager } from "../../../manager/project/languageManager";
import { liveServerManager } from "../../../manager/project/liveserverManager";
import { livestreamManager } from "../../../manager/project/livestreamManager";
import { regionMasterManager } from "../../../manager/project/regionServerManager";
import { Utils } from "../../../utils/utils";

async function InitJob() {
    const instanceIp=Utils.getInstanceIp()

    ipRegionInfo.init();
    //area to region map
    ipRegionInfo.updateAreaToRegionMap();
    liveServerManager.updateLiveServerMap();
    
    //apply Master
    await regionMasterManager.ApplyForRegionMaster()

    if (regionMasterManager.isRegionMaster) {
        livestreamManager.InitWatched();
    }
    // if ((process.env.NODE_APP_INSTANCE === "0"&&instanceIp===config.singleInstanceIp) || config.node_env === "develop") {
    //     //only 1 process
    //     livestreamManager.InitWatched();
    // }
}

function StartScheduleJob() {
    const instanceIp=Utils.getInstanceIp()
    
    console.info("process id:",process.env.NODE_APP_INSTANCE);
    //update region and liveServer info every 10 mins
    schedule.scheduleJob("ScheduleUpdateRegionAndLiveServerInfo", "0 0/10 * * * *", async () => {
        await ipRegionInfo.updateAreaToRegionMap;
        await liveServerManager.updateLiveServerMap;
    });

    schedule.scheduleJob("ScheduleUpdateConfig","3 0/10 * * * *",async()=>{
        await categoryManager.centerRefreshCategory()
        await languageManager.centerRefreshLanguage()
    })

    schedule.scheduleJob("ScheduleUpdateConfig","0/10 * * * * *",async()=>{
        await regionMasterManager.ApplyForRegionMaster()
        await regionMasterManager.KeepRegionMasterToken()
    })
    

    //only 1 process
    //update watched every 2 mins
    schedule.scheduleJob("ScheduleUpdateWatched", "5 0/2 * * * *", livestreamManager.ScheduleUpdateWatched);
    
}

export { InitJob, StartScheduleJob };

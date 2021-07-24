/*
 * @Author: your name
 * @Date: 2021-07-13 09:08:07
 * @LastEditTime: 2021-07-23 11:05:09
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/subapp/centerapp/job/job.ts
 */

import schedule from "node-schedule";
import { config } from "../../../config/conf";
import { categoryManager } from "../../../manager/project/categoryManager";
import { ipRegionInfo } from "../../../manager/project/ipRegionInfo";
import { languageManager } from "../../../manager/project/languageManager";
import { liveServerManager } from "../../../manager/project/liveServerManager";
import { livestreamManager } from "../../../manager/project/livestreamManager";

function InitJob() {
    ipRegionInfo.init();
    //area to region map
    ipRegionInfo.updateAreaToRegionMap();
    liveServerManager.updateLiveServerMap();

    if (process.env.NODE_APP_INSTANCE === "0" || config.node_env === "develop") {
        //only 1 process
        livestreamManager.InitWatched();
    }
}

function StartScheduleJob() {
    //update region and liveServer info every 10 mins
    schedule.scheduleJob("ScheduleUpdateRegionAndLiveServerInfo", "0 0/10 * * * *", async () => {
        await ipRegionInfo.updateAreaToRegionMap;
        await liveServerManager.updateLiveServerMap;
    });

    schedule.scheduleJob("ScheduleUpdateConfig","3 0/10 * * * *",async()=>{
        await categoryManager.centerRefreshCategory()
        await languageManager.centerRefreshLanguage()
    })

    //only 1 process
    if (process.env.NODE_APP_INSTANCE === "0" || config.node_env === "develop") {
        //update watched every 5 mins
        schedule.scheduleJob("ScheduleUpdateWatched", "5 0/5 * * * *", livestreamManager.ScheduleUpdateWatched);
    }
}

export { InitJob, StartScheduleJob };

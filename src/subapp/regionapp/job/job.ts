/*
 * @Author: your name
 * @Date: 2021-07-13 09:17:43
 * @LastEditTime: 2021-07-23 11:05:37
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/subapp/regionapp/job/job.ts
 */

import schedule from 'node-schedule';
import { categoryManager } from '../../../manager/project/categoryManager';
import { ipRegionInfo } from '../../../manager/project/ipRegionInfo';
import { languageManager } from '../../../manager/project/languageManager';
import { liveServerManager } from '../../../manager/project/liveServerManager';

function InitJob(){
    ipRegionInfo.init()
}


function StartScheduleJob(){
    schedule.scheduleJob("ScheduleUpdateConfig","3 0/10 * * * *",async()=>{
        await categoryManager.regionRefreshCategory()
        await languageManager.regionRefreshLanguage()
    })
    
}

export{InitJob, StartScheduleJob}
/*
 * @Author: your name
 * @Date: 2021-07-13 09:17:43
 * @LastEditTime: 2021-07-21 14:44:26
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/subapp/regionapp/job/job.ts
 */

import schedule from 'node-schedule';
import { ipRegionInfo } from '../../../manager/project/ipRegionInfo';
import { liveServerManager } from '../../../manager/project/liveServerManager';

function InitJob(){
    ipRegionInfo.init()
}


function StartScheduleJob(){
  
    
}

export{InitJob, StartScheduleJob}
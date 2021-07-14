/*
 * @Author: your name
 * @Date: 2021-07-13 09:08:07
 * @LastEditTime: 2021-07-13 10:02:34
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/subapp/centerapp/job/job.ts
 */

import schedule from 'node-schedule';
import { liveServerManager } from '../../../manager/project/liveserverManager';

function StartScheduleJob(){
    //SeparateActiveLiveServer every 2 min
    schedule.scheduleJob("ScheduleSeparateActiveLiveServer",'0/5 * * * * *',liveServerManager.ScheduleSeparateActiveLiveServer)

}

export{StartScheduleJob}
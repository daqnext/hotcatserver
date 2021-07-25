/*
 * @Author: your name
 * @Date: 2021-07-13 08:59:15
 * @LastEditTime: 2021-07-13 09:06:59
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/manager/project/scheduleJob.ts
 */
import schedule from "node-schedule";

class scheduleJob {
    static AddScheduleJob(
        jobName: string,
        rule: string | number | schedule.RecurrenceRule | schedule.RecurrenceSpecDateRange | schedule.RecurrenceSpecObjLit | Date,
        callback: schedule.JobCallback
    ) {
        const job = schedule.scheduleJob(jobName, rule, callback);
        console.info("schedule job standby:", job.name);
    }
}

export { scheduleJob };

/*
 * @Author: your name
 * @Date: 2021-07-12 11:02:01
 * @LastEditTime: 2021-07-15 15:25:15
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/manager/project/liveserverManager.ts
 */

import { ERegion, ILiveServerInfo } from "../../interface/interface";
import { redisTool } from "../../redis/redisTool";
import _ from "lodash";
import moment from "moment";

const LiveServerInfo_hash = "LiveServerInfo";
const UploadServer_zset = "UploadLiveServer";

const AliveServerPrefix = "AliveLiveServer_";

class liveServerManager {
    static async ScheduleSeparateActiveLiveServer() {
        //console.log("ScheduleSeparateActiveLiveServer start");
        
        const now = moment.now();
        const timeLimit = now- 130*1000;
        const ips = await redisTool
            .getSingleInstance()
            .redis.zrangebyscore(UploadServer_zset, timeLimit, now);

        //console.log(ips);
        
        const tempMap: { [location: string]: string[] } = {};
        
        let redisPipe = redisTool.getSingleInstance().redis.pipeline();
        for (let i = 0; i < ips.length; i++) {
            redisPipe.hget(LiveServerInfo_hash,ips[i])
        }
        const result=await redisPipe.exec()
        const infoStr:string[]=[]
        for (let i = 0; i < result.length; i++) {
            if (result[i][0]) {
                continue
            }
            infoStr.push(result[i][1])
        }
        
        
        for (let i = 0; i < infoStr.length; i++) {
            const info: ILiveServerInfo = JSON.parse(infoStr[i]);
            //global
            if (!tempMap[AliveServerPrefix + "global"]) {
                tempMap[AliveServerPrefix + "global"] = [];
            }
            tempMap[AliveServerPrefix + "global"].push(info.deviceId);

            //region
            if (!tempMap[AliveServerPrefix + info.ipInfo.region]) {
                tempMap[AliveServerPrefix + info.ipInfo.region] = [];
            }
            tempMap[AliveServerPrefix + info.ipInfo.region].push(info.deviceId);

            //continent
            if (!tempMap[AliveServerPrefix + info.ipInfo.continent]) {
                tempMap[AliveServerPrefix + info.ipInfo.continent] = [];
            }
            tempMap[AliveServerPrefix + info.ipInfo.continent].push(info.deviceId);

            //country
            if (!tempMap[AliveServerPrefix + info.ipInfo.country]) {
                tempMap[AliveServerPrefix + info.ipInfo.country] = [];
            }
            tempMap[AliveServerPrefix + info.ipInfo.country].push(info.deviceId);
        }

        let redisMulti = redisTool.getSingleInstance().redis.multi();
        for (const key in tempMap) {
            redisMulti = redisMulti.del(key).sadd(key, tempMap[key]).expire(key, 135);
        }
        redisMulti.exec((err, result) => {
            if (err) {
                console.error("ScheduleSeparateActiveLiveServer multi exec error:", err);
            }
        });
    }

    static UpdateLiveServerInfo(info: ILiveServerInfo) {
        try {
            redisTool
                .getSingleInstance()
                .redis.zadd(UploadServer_zset, info.heartBeatTimeStamp, info.deviceId);

            const field = info.deviceId;
            const str = JSON.stringify(info);
            redisTool.getSingleInstance().redis.hset(LiveServerInfo_hash, field, str);
        } catch (error) {
            console.error("UpdateLiveServerInfo error:", error);
        }
    }

    static async GetLiveServerByDeviceId(deviceId: string): Promise<ILiveServerInfo> {
        try {
            const infoStr = await redisTool.getSingleInstance().redis.hget(LiveServerInfo_hash, deviceId);
            if (infoStr === "") {
                return null;
            }
            const info: ILiveServerInfo = JSON.parse(infoStr);
            if (info.heartBeatTimeStamp<moment.now()-130*1000) {
                info.status="DOWN"
            }
            return info;
        } catch (error) {
            console.error("GetLiveServerByIp error:", error, "deviceId:", deviceId);
            return null;
        }
    }

    static async GetAllLiveServer() {
        try {
            const liveServers:ILiveServerInfo[]=[]
            const nowTime=moment.now()
            const timeLimit = nowTime- 130*1000;
            const serverInfoStr=await redisTool.getSingleInstance().redis.hgetall(LiveServerInfo_hash)
            for (const key in serverInfoStr) {
                const info: ILiveServerInfo = JSON.parse(serverInfoStr[key]);
                if (info.heartBeatTimeStamp<timeLimit) {
                    info.status="DOWN"
                }
                liveServers.push(info)
            }
            return liveServers
        } catch (error) {
            console.error("GetAllLiveServer error:",error);
            return null
        }
    }

    static async GetAliveLiveServerWithUpLevelRegionBackup(
        region: ERegion,
        continent: string,
        country: string
    ) {
        const countryKey = AliveServerPrefix + country;
        const continentKey = AliveServerPrefix + continent;
        const regionKey = AliveServerPrefix + region;
        const globalKey = AliveServerPrefix + "global";
        const keys = [countryKey, continentKey, regionKey, globalKey];
        let serverDeviceId = "";
        for (let i = 0; i < keys.length; i++) {
            let ids = await redisTool.getSingleInstance().redis.smembers(keys[i]);
            if (ids.length <= 0) {
                continue;
            }
            if (continent==="Asia"&&country!=="China") {
                const cIds=await redisTool.getSingleInstance().redis.smembers(AliveServerPrefix+"China");
                if (ids.length>cIds.length) {
                    ids=_.without(ids,...cIds)
                } 
            }
            const index = _.random(ids.length - 1);
            serverDeviceId = ids[index];
        }
        if (serverDeviceId === "") {
            return null;
        }
        const info = await this.GetLiveServerByDeviceId(serverDeviceId);
        return info;
    }
}
export { liveServerManager };

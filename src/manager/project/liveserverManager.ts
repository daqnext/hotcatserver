/*
 * @Author: your name
 * @Date: 2021-07-12 11:02:01
 * @LastEditTime: 2021-07-13 12:13:58
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
            tempMap[AliveServerPrefix + "global"].push(info.ip);

            //region
            if (!tempMap[AliveServerPrefix + info.ipInfo.region]) {
                tempMap[AliveServerPrefix + info.ipInfo.region] = [];
            }
            tempMap[AliveServerPrefix + info.ipInfo.region].push(info.ip);

            //continent
            if (!tempMap[AliveServerPrefix + info.ipInfo.continent]) {
                tempMap[AliveServerPrefix + info.ipInfo.continent] = [];
            }
            tempMap[AliveServerPrefix + info.ipInfo.continent].push(info.ip);

            //country
            if (!tempMap[AliveServerPrefix + info.ipInfo.country]) {
                tempMap[AliveServerPrefix + info.ipInfo.country] = [];
            }
            tempMap[AliveServerPrefix + info.ipInfo.country].push(info.ip);
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
                .redis.zadd(UploadServer_zset, info.heartBeatTimeStamp, info.ip);

            const field = info.ip;
            const str = JSON.stringify(info);
            redisTool.getSingleInstance().redis.hset(LiveServerInfo_hash, field, str);
        } catch (error) {
            console.error("UpdateLiveServerInfo error:", error);
        }
    }

    static async GetLiveServerByIp(ip: string): Promise<ILiveServerInfo> {
        try {
            const infoStr = await redisTool.getSingleInstance().redis.hget(LiveServerInfo_hash, ip);
            if (infoStr === "") {
                return null;
            }
            const info: ILiveServerInfo = JSON.parse(infoStr);
            return info;
        } catch (error) {
            console.error("GetLiveServerByIp error:", error, "ip:", ip);
            return null;
        }
    }

    static GetAliveLiveServer() {}

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
        let serverIp = "";
        for (let i = 0; i < keys.length; i++) {
            const ips = await redisTool.getSingleInstance().redis.smembers(keys[i]);
            if (ips.length <= 0) {
                continue;
            }
            const index = _.random(ips.length - 1);
            serverIp = ips[index];
        }
        if (serverIp === "") {
            return null;
        }
        const info = await this.GetLiveServerByIp(serverIp);
        return info;
    }
}
export { liveServerManager };

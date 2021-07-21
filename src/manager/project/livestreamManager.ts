/*
 * @Author: your name
 * @Date: 2021-07-08 12:24:01
 * @LastEditTime: 2021-07-21 23:42:20
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/manager/livestreamManager.ts
 */

import { livestreamModel } from "../../model/livestreamModel";
import randomString from "string-random";
import moment from "moment";
import { logger } from "../../global";
import { SqlTool } from "../../db/SqlTool";
import { liveServerManager } from "./liveServerManager";
import { redisTool } from "../../redis/redisTool";
import { ELiveStreamStatus } from "../../interface/interface";

const LiveStreamInfo_id_string = "LiveStreamInfo_";
const LiveStreamWatched_zset = "LiveStreamWatched"

class livestreamManager {
    static async CreateLiveStream(
        userId: number,
        userName: string,
        streamName: string,
        subTitle: string,
        description: string,
        category: string,
        region: string,
        coverImgUrl: string
    ): Promise<{ livestream: livestreamModel; errMsg: string }> {
        try {
            //rand streamKey
            let count = 0;
            let secret = "";
            let ok = false;
            do {
                count++;
                secret = randomString(10, {
                    letters: "abcdefghijklmnopqrstuvwxyz",
                });
                let livestream = await livestreamModel.findOne({
                    where: { secret: secret },
                });
                if (livestream == null) {
                    ok = true;
                    break;
                }
            } while (count < 10);
            if (ok == false) {
                return { livestream: null, errMsg: "key duplicated" };
            }

            let livestream = await livestreamModel.create({
                name: streamName,
                userId: userId,
                userName: userName,
                subTitle: subTitle,
                description: description,
                category: category,
                region: region,
                secret: secret,
                status: "ready",
                duration: 0,
                createTimeStamp: moment.now(),
                startTimeStamp: 0,
                endTimeStamp: 0,
                coverImgUrl: coverImgUrl,
            });

            //save to redis

            return { livestream: livestream, errMsg: "" };
        } catch (error) {
            console.error("create new live stream", error);
            return { livestream: null, errMsg: error };
        }
    }

    static async GetLiveStreamUrl(region: string, liveStreamId: number, streamSecret: string) {
        const serverInfo = await liveServerManager.GetLiveServerByRegion(region);
        if (serverInfo === null) {
            return null;
        }

        return {
            rtmpLink: serverInfo.rtmpServerAddress + "/live?secret=" + streamSecret,
            originLiveM3u8Link: serverInfo.storageSeverAddress + "/hls/" + liveStreamId + "/index.m3u8",
            cdnLiveM3u8Link: "/api/livecdn/live/m3u8/playlist/live_" + liveStreamId + "/index.m3u8",
            originRecordM3u8Link: serverInfo.storageSeverAddress + "/record/" + liveStreamId + "/index.m3u8",
            cdnRecordM3u8Link: "/api/livecdn/record/m3u8/playlist/live_" + liveStreamId + "/index.m3u8",
        };
    }

    static async DirectQueryLiveStreams(
        queryCondition,
        limit: number = null,
        offset: number = null,
        order = null
    ): Promise<{ rows: livestreamModel[]; count: number }> {
        let query: any = {
            where: queryCondition,
        };
        if (limit !== null && offset !== null) {
            query.limit = limit;
            query.offset = offset;
        }

        if (order) {
            query.order = order;
        }

        //redis //protect sql
        const key = JSON.stringify(query);
        const resultStr = await redisTool.getSingleInstance().redis.get(key);
        if (resultStr) {
            const data = JSON.parse(resultStr);
            return { rows: data.rows, count: data.count };
        }

        try {
            const result = await livestreamModel.findAndCountAll(query);
            //to redis
            const str = JSON.stringify(result);
            if (str) {
                redisTool.getSingleInstance().redis.set(key, str, "EX", 3);
            }
            return { rows: result.rows, count: result.count };
        } catch (error) {
            console.error("query live stream error", error, query);
            return { rows: [], count: 0 };
        }
    }

    static async UpdateLiveStream(
        id: number,
        userId: number,
        secret: string,
        streamName: string,
        subTitle: string,
        description: string,
        category: string,
        coverImgUrl: string
    ): Promise<{ livestream: livestreamModel; errMsg: string }> {
        //update sql
        try {
            const [count, updated] = await livestreamModel.update(
                {
                    streamName: streamName,
                    subTitle: subTitle,
                    description: description,
                    category: category,
                    coverImgUrl: coverImgUrl,
                },
                { where: { id: id, userId: userId, secret: secret } }
            );
            if (count <= 0) {
                return { livestream: null, errMsg: "update livestream error" };
            }

            //update redis
            const key = LiveStreamInfo_id_string + id;
            const infoStr = JSON.stringify(updated[0]);
            redisTool.getSingleInstance().redis.set(key, infoStr, "EX", 600);

            return { livestream: updated[0], errMsg: "" };
        } catch (error) {
            console.error("update live stream error:", error, "id:", id);
            return { livestream: null, errMsg: "update livestream error" };
        }
    }

    static async ModifyStreamStatus(id: number, secret: string, newStatus: ELiveStreamStatus) {
        //update sql
        try {
            const updateData: any = {
                status: newStatus,
            };

            switch (newStatus) {
                case ELiveStreamStatus.END:
                case ELiveStreamStatus.PAUSE:
                    updateData.endTimeStamp = moment.now();
                    break;
                case ELiveStreamStatus.ONLIVE:
                    updateData.startTimeStamp = moment.now();
                    break;
            }

            const [count, updated] = await livestreamModel.update(updateData, { where: { id: id, secret: secret } });
            if (count <= 0) {
                return { livestream: null, errMsg: "update livestream error" };
            }

            //update redis
            const key = LiveStreamInfo_id_string + id;
            const infoStr = JSON.stringify(updated[0]);
            redisTool.getSingleInstance().redis.set(key, infoStr, "EX", 600);

            return { livestream: updated[0], errMsg: "" };
        } catch (error) {
            console.error("update live stream error:", error, "id:", id);
            return { livestream: null, errMsg: "update livestream error" };
        }
    }

    static async DeleteLiveStream(streamId: number, secret: string): Promise<boolean> {
        try {
            const number = await livestreamModel.destroy({
                where: { id: streamId, secret: secret },
            });
            if (number > 0) {
                //delete redis
                const key = LiveStreamInfo_id_string + streamId;
                redisTool.getSingleInstance().redis.del(key);

                return true;
            }
            return false;
        } catch (error) {
            console.error("delete live stream error", error, "id:", streamId, "secret:", secret);
            return false;
        }
    }

    static async GetLiveStreamBySecret(secret: string): Promise<{ livestream: livestreamModel; errMsg: string }> {
        try {
            const liveStream = await livestreamModel.findOne({ where: { secret: secret } });
            return { livestream: liveStream, errMsg: "" };
        } catch (error) {
            console.error("query live stream by secret error", error, "secret=", secret);
            return { livestream: null, errMsg: error };
        }
    }

    static async GetLiveStreamById(streamId: number): Promise<{ livestream: livestreamModel; errMsg: string }> {
        try {
            //from redis

            //from db
            const liveStream = await livestreamModel.findByPk(streamId);

            //set to redis

            return { livestream: liveStream, errMsg: "" };
        } catch (error) {
            console.error("query live stream by id error", error, "streamId=", streamId);
            return { livestream: null, errMsg: error };
        }
    }

    static async AddWatched(streamId:number){
        redisTool.getSingleInstance().redis.zincrby(LiveStreamWatched_zset,1,streamId+"")
    }

    static async InitWatched(){
        //get watched count from db when restart
        let count=0
        do {
            const watchedInfo=await livestreamModel.findAll({
                attributes:["id","watched"],
                limit:500,
                offset:count*500
            })
            if (!watchedInfo) {
                break
            }
            if (watchedInfo.length<=0) {
                break
            }
            const pipe=redisTool.getSingleInstance().redis.pipeline()
            for (let i = 0; i < watchedInfo.length; i++) { 
                if (watchedInfo[i].watched===0) {
                    continue
                }
                pipe.zincrby(LiveStreamWatched_zset,watchedInfo[i].watched,watchedInfo[i].id+"")
            }
            await pipe.exec()
            count++
        } while (true);
    }

    static async ScheduleUpdateWatched(){
        let startIndex=0
        do {
            const endIndex=startIndex+500
            const result = await redisTool.getSingleInstance().redis.zrange(LiveStreamWatched_zset,startIndex,endIndex,"WITHSCORES")
            if (result===null) {
                break
            }
            if (result.length<=0) {
                break
            }

            const insertData:{id:number,watched:number}[]=[]
            for (let i = 0; i < result.length; i=i+2) {
                const id=parseInt(result[i])
                const watched=parseInt(result[i+1])
                const data={id:id,watched:watched}
                insertData.push(data)
            }
            
            livestreamModel.bulkCreate(insertData,{updateOnDuplicate:['id']})
            startIndex++
        } while (true);
    }
}

export { livestreamManager };

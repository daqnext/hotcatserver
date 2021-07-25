/*
 * @Author: your name
 * @Date: 2021-07-08 12:24:01
 * @LastEditTime: 2021-07-25 14:51:00
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/manager/livestreamManager.ts
 */

import { livestreamModel } from "../../model/livestreamModel";
import randomString from "string-random";
import moment from "moment";
import _ from "lodash";
import fs, { watch } from "fs";
import { liveServerManager } from "./liveserverManager";
import { redisTool } from "../../redis/redisTool";
import { ELiveStreamStatus, ILiveStream } from "../../interface/interface";
import { QueryTypes, Sequelize } from "sequelize/types";
import { SqlTool } from "../../db/SqlTool";
import path from "path";
import { rootDIR } from "../../global";
import { categoryManager } from "./categoryManager";

//stream cache
const LiveStreamCache_id_string = "LiveStreamInfo_string_id_";
//const LiveStreamCache_id_hash = "LiveStreamCache_hash_id_";

//watched increase
const LiveStreamWatchedIncrease_hash = "LiveStreamWatchedIncrease";

//watched rank
const WatchRankByCategory_category_zset = "WatchRankByCategory_category_";
const WatchRankTotal_zset = "WatchRankTotal";

class livestreamManager {
    static async CreateLiveStream(
        userId: number,
        userName: string,
        streamName: string,
        subTitle: string,
        description: string,
        category: string,
        language: string,
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
                language: language,
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
            cdnLiveM3u8Link: "http://coldcdn.com/api/livecdn/live/m3u8/playlist/live_" + liveStreamId + "/index.m3u8",
            originRecordM3u8Link: serverInfo.storageSeverAddress + "/record/" + liveStreamId + "/index.m3u8",
            cdnRecordM3u8Link: "http://coldcdn.com/api/livecdn/record/m3u8/playlist/live_" + liveStreamId + "_record/index.m3u8",
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
        secret: string,
        streamName: string,
        subTitle: string,
        description: string,
        category: string,
        language: string,
        coverImgUrl: string
    ): Promise<boolean> {
        //update sql
        try {
            //get old info
            const oldStreamInfo = await this.GetLiveStreamById(id);
            if (oldStreamInfo === null) {
                return false;
            }

            const updateData = {
                name: streamName,
                subTitle: subTitle,
                description: description,
                category: category,
                language: language,
                coverImgUrl: coverImgUrl,
            };
            const [count] = await livestreamModel.update(updateData, { where: { id: id, secret: secret } });
            if (count <= 0) {
                return false;
            }

            //update redis
            this.updateStreamInfoInRedis(id, updateData);

            //move category if need
            if (oldStreamInfo.category !== category) {
                console.log("category modify");
                const removeKey = WatchRankByCategory_category_zset + oldStreamInfo.category;
                const addKey = WatchRankByCategory_category_zset + category;
                const idStr = id + "";
                const watched = await redisTool.getSingleInstance().redis.zscore(removeKey, idStr);
                const pipe = redisTool.getSingleInstance().redis.pipeline();
                pipe.zrem(removeKey, idStr);
                pipe.zincrby(addKey, parseInt(watched), idStr);
                pipe.exec();
            }

            return true;
        } catch (error) {
            console.error("update live stream error:", error, "id:", id);
            return false;
        }
    }

    static async ModifyStreamStatus(id: number, secret: string, newStatus: ELiveStreamStatus) {
        //update sql
        try {
            const updateData: any = {
                status: newStatus,
            };

            //get old info
            const oldStreamInfo = await this.GetLiveStreamById(id);
            if (oldStreamInfo === null) {
                return false;
            }

            let duration = oldStreamInfo.duration;
            switch (newStatus) {
                case ELiveStreamStatus.END:
                case ELiveStreamStatus.PAUSE:
                    updateData.endTimeStamp = moment.now();
                    updateData.duration = oldStreamInfo.duration + (updateData.endTimeStamp - oldStreamInfo.startTimeStamp);
                    duration = updateData.duration;
                    break;
                case ELiveStreamStatus.ONLIVE:
                    updateData.startTimeStamp = moment.now();
                    break;
            }

            const [count] = await livestreamModel.update(updateData, { where: { id: id, secret: secret } });

            if (count <= 0) {
                return false;
            }

            //update redis
            this.updateStreamInfoInRedis(id, updateData);

            //add or remove onlive rank
            switch (newStatus) {
                case ELiveStreamStatus.END:
                case ELiveStreamStatus.PAUSE:
                    //remove form Online rank
                    redisTool.getSingleInstance().redis.zrem(WatchRankByCategory_category_zset + ELiveStreamStatus.ONLIVE, id + "");

                    if (duration >= 8000) {
                        redisTool.getSingleInstance().redis.zincrby(WatchRankByCategory_category_zset + oldStreamInfo.category, 0, id + "");
                        redisTool.getSingleInstance().redis.zincrby(WatchRankTotal_zset, 0, id + "");
                    }

                    break;
                case ELiveStreamStatus.ONLIVE:
                    //add to online rank
                    const watched = await redisTool.getSingleInstance().redis.zscore(WatchRankTotal_zset, id + "");
                    let count = 0;
                    if (watched !== null) {
                        count = parseInt(watched);
                    }
                    redisTool.getSingleInstance().redis.zincrby(WatchRankByCategory_category_zset + ELiveStreamStatus.ONLIVE, count, id + "");
                    break;
            }

            return true;
        } catch (error) {
            console.error("update live stream error:", error, "id:", id);
            return false;
        }
    }

    static async DeleteLiveStream(streamId: number, secret: string): Promise<boolean> {
        try {
            const record = await livestreamModel.findOne({
                attributes: ["id", "region", ["cover_img_url", "coverImgUrl"]],
                where: {
                    id: streamId,
                    secret: secret,
                },
            });
            console.log(record);

            const number = await livestreamModel.destroy({
                where: { id: streamId, secret: secret },
            });
            if (number > 0) {
                //delete cover
                const fileName = record.coverImgUrl;
                let saveFilePath = path.join(rootDIR, "../", fileName);
                console.log(saveFilePath);

                if (fs.existsSync(saveFilePath)) {
                    fs.unlinkSync(saveFilePath);
                }

                //delete record

                //delete redis
                const key = LiveStreamCache_id_string + streamId;
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

    static async GetLiveStreamById(streamId: number): Promise<ILiveStream> {
        try {
            //from redis
            const info = await this.getFromRedis(streamId);
            if (info) {
                return info;
            }

            //from db
            const livestream = await livestreamModel.findByPk(streamId);
            const streamUrl = await livestreamManager.GetLiveStreamUrl(livestream.region, livestream.id, livestream.secret);
            const streamInfo: ILiveStream = {
                id: livestream.id,
                name: livestream.name,
                subTitle: livestream.subTitle,
                category: livestream.category,
                description: livestream.description,
                language: livestream.language,
                userId: livestream.userId,
                userName: livestream.userName,
                region: livestream.region,
                //secret: livestream.secret,
                status: livestream.status,
                duration: livestream.duration,
                createTimeStamp: livestream.createTimeStamp,
                startTimeStamp: livestream.startTimeStamp,
                endTimeStamp: livestream.endTimeStamp,
                coverImgUrl: livestream.coverImgUrl,
                watched: livestream.watched,
                rtmpLink: streamUrl.rtmpLink,
                originLiveM3u8Link: streamUrl.originLiveM3u8Link,
                cdnLiveM3u8Link: streamUrl.cdnLiveM3u8Link,
                originRecordM3u8Link: streamUrl.originRecordM3u8Link,
                cdnRecordM3u8Link: streamUrl.cdnRecordM3u8Link,
            };

            //set to redis
            this.setToRedis(streamInfo, 3600);

            return streamInfo;
        } catch (error) {
            console.error("query live stream by id error", error, "streamId=", streamId);
            return null;
        }
    }

    static async GetLiveStreamByRank(category: string | ELiveStreamStatus.ONLIVE, count: number) {
        const key = WatchRankByCategory_category_zset + category;
        const idsStr = await redisTool.getSingleInstance().redis.zrange(key, 0, count - 1);
        console.log(idsStr);

        const ids: number[] = idsStr.map((value) => parseInt(value));
        console.log(ids);

        const content = await this.batchGetLiveStream(ids);
        console.log(content);

        return { id: ids, contentMap: content };
    }

    // batch get liveStream infos
    static async batchGetLiveStream(ids: number[]) {
        //from redis
        const pipe = redisTool.getSingleInstance().redis.pipeline();
        for (let i = 0; i < ids.length; i++) {
            const id = LiveStreamCache_id_string + ids[i];
            pipe.get(id);
        }
        const result = await pipe.exec();
        console.log(result);

        const streamInfoMap: { [index: number]: string } = {};
        const sqlQueryIds: number[] = [];
        for (let i = 0; i < result.length; i++) {
            if (result[i][1] === null) {
                sqlQueryIds.push(ids[i]);
                continue;
            }
            streamInfoMap[ids[i]] = result[i][1];
        }

        if (sqlQueryIds.length <= 0) {
            //return
            console.log(streamInfoMap);

            return streamInfoMap;
        }

        //if not in redis, query in sql
        const sqlResult = await livestreamModel.findAll({ where: { id: sqlQueryIds } });
        if (sqlResult.length > 0) {
            const pipe = redisTool.getSingleInstance().redis.pipeline();
            for (let i = 0; i < sqlResult.length; i++) {
                const livestream = sqlResult[i];
                const streamUrl = await livestreamManager.GetLiveStreamUrl(livestream.region, livestream.id, livestream.secret);
                const streamInfo: ILiveStream = {
                    id: livestream.id,
                    name: livestream.name,
                    subTitle: livestream.subTitle,
                    category: livestream.category,
                    description: livestream.description,
                    language: livestream.language,
                    userId: livestream.userId,
                    userName: livestream.userName,
                    region: livestream.region,
                    status: livestream.status,
                    duration: livestream.duration,
                    createTimeStamp: livestream.createTimeStamp,
                    startTimeStamp: livestream.startTimeStamp,
                    endTimeStamp: livestream.endTimeStamp,
                    coverImgUrl: livestream.coverImgUrl,
                    watched: livestream.watched,
                    rtmpLink: streamUrl.rtmpLink,
                    originLiveM3u8Link: streamUrl.originLiveM3u8Link,
                    cdnLiveM3u8Link: streamUrl.cdnLiveM3u8Link,
                    originRecordM3u8Link: streamUrl.originRecordM3u8Link,
                    cdnRecordM3u8Link: streamUrl.cdnRecordM3u8Link,
                };

                const str = JSON.stringify(streamInfo);
                streamInfoMap[streamInfo.id] = str;
                if (str !== "") {
                    const key = LiveStreamCache_id_string + streamInfo.id;
                    pipe.set(key, str, "EX", 3600);
                }
            }
            pipe.exec();
        }

        return streamInfoMap;
    }

    static async AddWatched(streamId: number, category: string) {
        const pipe = redisTool.getSingleInstance().redis.pipeline();
        const id = streamId + "";
        pipe.hincrby(LiveStreamWatchedIncrease_hash, id, 1);
        pipe.zincrby(WatchRankTotal_zset, 1, id);
        const key = WatchRankByCategory_category_zset + category;
        pipe.zincrby(key, 1, id);
        pipe.exec();

        const score = await redisTool.getSingleInstance().redis.zscore(WatchRankByCategory_category_zset + ELiveStreamStatus.ONLIVE, id);
        if (score !== null) {
            redisTool.getSingleInstance().redis.zincrby(WatchRankByCategory_category_zset + ELiveStreamStatus.ONLIVE, 1, id);
        }
    }

    static async InitWatched() {
        //get watched count from db when restart
        redisTool.getSingleInstance().redis.del(WatchRankTotal_zset);
        redisTool.getSingleInstance().redis.del(LiveStreamWatchedIncrease_hash);

        const { categoryMap } = await categoryManager.centerGetAllCategory();
        const cate = Object.keys(categoryMap);
        for (let i = 0; i < cate.length; i++) {
            redisTool.getSingleInstance().redis.del(WatchRankByCategory_category_zset + cate[i]);
        }
        redisTool.getSingleInstance().redis.del(WatchRankByCategory_category_zset + ELiveStreamStatus.ONLIVE);

        let count = 0;
        do {
            const watchedInfo = await livestreamModel.findAll({
                attributes: ["id", "watched", "category", "status"],
                limit: 300,
                offset: count * 300,
            });
            if (!watchedInfo) {
                break;
            }
            if (watchedInfo.length <= 0) {
                break;
            }
            const pipe = redisTool.getSingleInstance().redis.pipeline();
            for (let i = 0; i < watchedInfo.length; i++) {
                if (watchedInfo[i].status === ELiveStreamStatus.READY) {
                    continue;
                }
                if (watchedInfo[i].duration < 8000) {
                    continue;
                }
                if (watchedInfo[i].status === ELiveStreamStatus.ONLIVE) {
                    pipe.zincrby(WatchRankByCategory_category_zset + ELiveStreamStatus.ONLIVE, watchedInfo[i].watched, watchedInfo[i].id + "");
                }
                pipe.zincrby(WatchRankTotal_zset, watchedInfo[i].watched, watchedInfo[i].id + "");
                pipe.zincrby(WatchRankByCategory_category_zset + watchedInfo[i].category, watchedInfo[i].watched, watchedInfo[i].id + "");
            }
            await pipe.exec();
            count++;
        } while (true);
    }

    static async ScheduleUpdateWatched() {
        const result = await redisTool.getSingleInstance().redis.hgetall(LiveStreamWatchedIncrease_hash);
        if (result === null) {
            return;
        }
        redisTool.getSingleInstance().redis.del(LiveStreamWatchedIncrease_hash);
        const insertData: { id: number; watched: number }[] = [];
        for (let key in result) {
            const id = parseInt(key);
            const watched = parseInt(result[key]);
            const data = { id: id, watched: watched };
            insertData.push(data);
        }
        const insertArray = _.chunk(insertData, 300);
        for (let i = 0; i < insertArray.length; i++) {
            //livestreamModel.bulkCreate(insertArray[i], { updateOnDuplicate: ["id"] });

            const batch = insertArray[i];
            let sqlStr = "UPDATE livestreams SET watched = watched + CASE id ";
            const ids: number[] = []; //ids := []uint{}
            for (let j = 0; j < batch.length; j++) {
                ids.push(batch[j].id);
                let tempStr = `WHEN ${batch[j].id} THEN ${batch[j].watched} `;
                sqlStr += tempStr;
            }
            sqlStr += "END WHERE id IN(:ids)";
            await SqlTool.getSingleInstance().sequelize.query(sqlStr, {
                replacements: { ids: ids },
                //type: QueryTypes.UPDATE
            });
        }
    }

    static async batchGetWatched(ids: number[]) {
        const pipe = redisTool.getSingleInstance().redis.pipeline();
        for (let i = 0; i < ids.length; i++) {
            pipe.zscore(WatchRankTotal_zset, ids[i] + "");
        }
        const result = await pipe.exec();
        const watchedMap: { [id: number]: number } = {};
        for (let i = 0; i < result.length; i++) {
            if (result[i][1] === null) {
                continue;
            }
            watchedMap[ids[i]] = result[i][1];
        }
        return watchedMap;
    }

    static async getWatched(streamId: number) {
        const resultStr = await redisTool.getSingleInstance().redis.zscore(WatchRankTotal_zset, streamId + "");
        if (resultStr === null) {
            return 0;
        }
        const result = parseInt(resultStr);
        if (result === null) {
            return 0;
        }
        return result;
    }

    private static async updateStreamInfoInRedis(id: number, obj: { [key: string]: any }) {
        const key = LiveStreamCache_id_string + id;
        const result = await redisTool.getSingleInstance().redis.get(key);
        if (result === null) {
            return false;
        }
        const streamInfo: ILiveStream = JSON.parse(result);
        if (streamInfo === null) {
            return false;
        }
        for (const key in obj) {
            streamInfo[key] = obj[key];
        }
        const setResult = await this.setToRedis(streamInfo);
        return setResult;
    }

    private static async getFromRedis(id: number) {
        const key = LiveStreamCache_id_string + id;
        const str = await redisTool.getSingleInstance().redis.get(key);
        if (str === null) {
            return null;
        }
        const streamInfo: ILiveStream = JSON.parse(str);
        return streamInfo;
    }

    private static async setToRedis(info: ILiveStream, ex: number = null) {
        const str = JSON.stringify(info);
        if (str === "") {
            console.error("setToRedis JSON.stringify error,", "obj:", info);
            return false;
        }
        const key = LiveStreamCache_id_string + info.id;
        const result = await redisTool.getSingleInstance().redis.set(key, str, "KEEPTTL");
        if (ex !== null) {
            await redisTool.getSingleInstance().redis.expire(key, ex);
        }
        if (result !== "OK") {
            console.error("setToRedis set error,", "key:", key, "string:", str);
            return false;
        }
        return true;
    }

    // private static async getLiveStreamInfoFormRedis(id:number) {
    //     const key = LiveStreamCache_id_hash + id;
    //     const result = await redisTool.getSingleInstance().redis.hgetall(key);

    //     if (Object.keys(result).length === 0) {
    //         return null;
    //     }

    //     const info: ILiveStream = result as unknown as ILiveStream;
    //     info.id = parseInt(result.id);
    //     info.userId = parseInt(result.userId);
    //     info.duration = parseInt(result.duration);
    //     info.createTimeStamp = parseInt(result.createTimeStamp);
    //     info.startTimeStamp = parseInt(result.startTimeStamp);
    //     info.endTimeStamp = parseInt(result.endTimeStamp);
    //     info.watched = parseInt(result.watched);

    //     return info;
    // }
}

export { livestreamManager };

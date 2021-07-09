/*
 * @Author: your name
 * @Date: 2021-07-08 12:24:01
 * @LastEditTime: 2021-07-09 11:29:57
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/manager/livestreamManager.ts
 */

import { livestreamModel } from "../../model/livestreamModel";
import randomString from "string-random";
import moment from "moment";

class livestreamManager {
    static async CreateLiveStream(
        userId: number,
        userName: string,
        streamName: string
    ): Promise<{ livestream: livestreamModel; errMsg: string }> {
        try {
            //rand streamKey
            let count = 0;
            let streamKey = "";
            do {
                count++;
                streamKey = randomString(10, {
                    letters: "abcdefghijklmnopqrstuvwxyz",
                });
                let livestream = await livestreamModel.findOne({
                    where: { streamKey: streamKey },
                });
                if ((livestream = null)) {
                    break;
                }
            } while (count < 10);

            //createInRedis
            let livestream = await livestreamModel.create({
                name: streamName,
                userId: userId,
                userName: userName,
                streamKey: streamKey,
                status: "ready",
                duration: 0,
                createTimeStamp: moment.now(),
                startTimeStamp: 0,
                endTimeStamp: 0,
                trmpLink: "",
                originM3u8Link: "",
                cdnM3u8Link: "",
            });

            return { livestream: livestream, errMsg: "" };
        } catch (error) {
            console.error("create new live stream", error);
            return { livestream: null, errMsg: error };
        }
    }

    static async GetLiveStreams(
        queryCondition,
        limit: number = null,
        offset: number = null
    ): Promise<{ rows: livestreamModel[]; count: number }> {
        let query: any = {
            where: queryCondition,
        };
        if (limit !== null && offset !== null) {
            query.limit = limit;
            query.offset = offset;
        }

        try {
            const { rows, count } = await livestreamModel.findAndCountAll(query);
            return { rows, count };
        } catch (error) {
            console.error("query live stream error", error, query);
            return { rows: null, count: 0 };
        }
    }

    static async GetLiveStreamByKey(streamKey: string):Promise<{ livestream: livestreamModel; errMsg: string }> {
        try {
            const liveStream = await livestreamModel.findOne({where:{streamKeu:streamKey}});
            return { livestream:liveStream, errMsg:"" };
        } catch (error) {
            console.error("query live stream by key error", error, "streamKey=",streamKey);
            return { livestream:null, errMsg:error };
        }
    }

    static async GetLiveStreamById(streamId: number):Promise<{ livestream: livestreamModel; errMsg: string }>{
        try {
            const liveStream = await livestreamModel.findByPk(streamId);
            return { livestream:liveStream, errMsg:"" };
        } catch (error) {
            console.error("query live stream by id error", error, "streamId=",streamId);
            return { livestream:null, errMsg:error };
        }
    }
}

export { livestreamManager };

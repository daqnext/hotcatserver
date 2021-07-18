/*
 * @Author: your name
 * @Date: 2021-07-08 12:24:01
 * @LastEditTime: 2021-07-15 14:31:43
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/manager/livestreamManager.ts
 */

import { livestreamModel } from "../../model/livestreamModel";
import randomString from "string-random";
import moment from "moment";
import { logger } from "../../global";
import { SqlTool } from "../../db/SqlTool";
import { liveServerManager } from "./liveserverManager";

class livestreamManager {
    static async CreateLiveStream(
        userId: number,
        userName: string,
        streamName: string,
        subTitle: string,
        description: string,
        category: string,
        liveServerId: string,
        coverImgUrl: string
    ): Promise<{ livestream: livestreamModel; errMsg: string }> {
        try {
            //rand streamKey
            let count = 0;
            let streamKey = "";
            let ok = false;
            do {
                count++;
                streamKey = randomString(10, {
                    letters: "abcdefghijklmnopqrstuvwxyz",
                });
                let livestream = await livestreamModel.findOne({
                    where: { streamKey: streamKey },
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
                liveServerId: liveServerId,
                streamKey: streamKey,
                status: "ready",
                duration: 0,
                createTimeStamp: moment.now(),
                startTimeStamp: 0,
                endTimeStamp: 0,
                // rtmpLink: "rtmp://"+liveServerAddress+"/live/"+userId+"/"+newId+"?secret="+streamKey,
                // originM3u8Link: "http://"+liveServerAddress+":8080/live/"+userId+"/"+newId+"/playlist.m3u8",
                // cdnM3u8Link: "/api/livecdn/m3u8/playlist/live_"+newId+"/playlist.m3u8",
                coverImgUrl: coverImgUrl,
            });

            return { livestream: livestream, errMsg: "" };
        } catch (error) {
            console.error("create new live stream", error);
            return { livestream: null, errMsg: error };
        }
    }

    static async GetLiveStreamUrl(
        liveServerId: string,
        userId: number,
        liveStreamId: number,
        streamSecret: string
    ) {
        const serverInfo = await liveServerManager.GetLiveServerByDeviceId(liveServerId);
        if (serverInfo === null) {
            return null;
        }

        return {
            rtmpLink:
                "rtmp://" +
                serverInfo.ip +
                "/live/" +
                userId +
                "/" +
                liveStreamId +
                "?secret=" +
                streamSecret,
            originM3u8Link:
                "http://" +
                serverInfo.ip +
                ":8080/live/" +
                userId +
                "/" +
                liveStreamId +
                "/playlist.m3u8",
            cdnM3u8Link: "/api/livecdn/m3u8/playlist/live_" + liveStreamId + "/playlist.m3u8",
        };
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

    static async DeleteLiveStream(streamId: number, streamKey: string): Promise<boolean> {
        try {
            const number = await livestreamModel.destroy({
                where: { id: streamId, streamKey: streamKey },
            });
            if (number > 0) {
                return true;
            }
            return false;
        } catch (error) {
            console.error(
                "delete live stream error",
                error,
                "id:",
                streamId,
                "streamKey:",
                streamKey
            );
            return false;
        }
    }

    static async GetLiveStreamByKey(
        streamKey: string
    ): Promise<{ livestream: livestreamModel; errMsg: string }> {
        try {
            const liveStream = await livestreamModel.findOne({ where: { streamKeu: streamKey } });
            return { livestream: liveStream, errMsg: "" };
        } catch (error) {
            console.error("query live stream by key error", error, "streamKey=", streamKey);
            return { livestream: null, errMsg: error };
        }
    }

    static async GetLiveStreamById(
        streamId: number
    ): Promise<{ livestream: livestreamModel; errMsg: string }> {
        try {
            const liveStream = await livestreamModel.findByPk(streamId);
            return { livestream: liveStream, errMsg: "" };
        } catch (error) {
            console.error("query live stream by id error", error, "streamId=", streamId);
            return { livestream: null, errMsg: error };
        }
    }
}

export { livestreamManager };

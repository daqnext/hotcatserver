/*
 * @Author: your name
 * @Date: 2021-07-22 22:37:35
 * @LastEditTime: 2021-07-23 13:37:23
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/test/test_liveStreamRedis.ts
 */

import { ELiveStreamStatus, ILiveStream } from "../src/interface/interface";
import { livestreamManager } from "../src/manager/project/livestreamManager";
import { redisTool } from "../src/redis/redisTool";

describe("livestream redis test", function () {
    //it("set object to redis hash test", hashSet)
    //it("set object to redis string test",stringSet)
    //it("get object from redis hash test", hashGet)
    //it("get object from redis string test",stringGet)
    it("get object from redis string test",batchGet)
});

async function hashSet(){
    const streamInfo: ILiveStream = {
        id: 2,
        name: "name",
        subTitle: "sbuTitle",
        category: "category",
        language:"English",
        description: "description",
        userId: 10,
        userName: "userName",
        region: "region",
        secret: "secret",
        status: ELiveStreamStatus.ONLIVE,
        duration: 10,
        createTimeStamp: 123456,
        startTimeStamp: 123456,
        endTimeStamp: 123456,
        coverImgUrl: "coverImgUrl",
        watched: 123456,
        //rtmpLink: "rtmpLInk",
        originLiveM3u8Link: "originLiveM3u8Link",
        cdnLiveM3u8Link: "cdnLiveM3u8Link",
        originRecordM3u8Link: "originRecordM3u8Link",
        cdnRecordM3u8Link: "cdnRecordM3u8Link",
    };

    for (let i = 0; i < 1000; i++) {
        await livestreamManager.setToRedis(streamInfo, 3000);
    }
}

async function stringSet() {
    const streamInfo: ILiveStream = {
        id: 2,
        name: "name",
        subTitle: "sbuTitle",
        category: "category",
        language:"English",
        description: "description",
        userId: 10,
        userName: "userName",
        region: "region",
        secret: "secret",
        status: ELiveStreamStatus.ONLIVE,
        duration: 10,
        createTimeStamp: 123456,
        startTimeStamp: 123456,
        endTimeStamp: 123456,
        coverImgUrl: "coverImgUrl",
        watched: 123456,
        rtmpLink: "rtmpLInk",
        originLiveM3u8Link: "originLiveM3u8Link",
        cdnLiveM3u8Link: "cdnLiveM3u8Link",
        originRecordM3u8Link: "originRecordM3u8Link",
        cdnRecordM3u8Link: "cdnRecordM3u8Link",
    };

    for (let i = 0; i < 1000; i++) {
        const str=JSON.stringify(streamInfo)
        await redisTool.getSingleInstance().redis.set("test_id_2",str,"EX",3000)
        
    }
}

async function hashGet(){
    for (let i = 0; i < 5000; i++) {
        await livestreamManager.getLiveStreamInfoFormRedis(2)
    }
}

async function stringGet(){
    for (let i = 0; i < 5000; i++) {
        const str=await redisTool.getSingleInstance().redis.get("test_id_2")
        //const info=JSON.parse(str)
    }
}

async function batchGet(){
    for (let i = 10; i <= 20; i=i+2) {
        const id=i
        const streamInfo: ILiveStream = {
            id: id,
            name: "name",
            subTitle: "sbuTitle",
            category: "category",
            language:"English",
            description: "description",
            userId: 10,
            userName: "userName",
            region: "region",
            secret: "secret",
            status: ELiveStreamStatus.ONLIVE,
            duration: 10,
            createTimeStamp: 123456,
            startTimeStamp: 123456,
            endTimeStamp: 123456,
            coverImgUrl: "coverImgUrl",
            watched: 123456,
            //rtmpLink: "rtmpLInk",
            originLiveM3u8Link: "originLiveM3u8Link",
            cdnLiveM3u8Link: "cdnLiveM3u8Link",
            originRecordM3u8Link: "originRecordM3u8Link",
            cdnRecordM3u8Link: "cdnRecordM3u8Link",
        };

        const str=JSON.stringify(streamInfo)
        await redisTool.getSingleInstance().redis.set(id+"",str,"EX",3000)
    }

    const listIds=[10,11,12,13,14,15,16,17,18,19]
    const pipe=redisTool.getSingleInstance().redis.pipeline()
    for (let i = 0; i <listIds.length; i++) {
        const id=listIds[i]+""
        pipe.get(id)
    }
    const result=await pipe.exec()
    console.log(result);

    const streamInfoMap:{[index:number]:number}={}
    const queryIds:number[]=[]
    for (let i = 0; i < result.length; i++) {
        if (result[i][1]===null) {
            
            queryIds.push(listIds[i])
            continue
        }
        streamInfoMap[listIds[i]]=result[i][1]
    }
    console.log("findMap:",streamInfoMap);
    console.log("queryIds:",queryIds);
    
    
    
}

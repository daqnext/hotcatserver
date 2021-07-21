/*
 * @Author: your name
 * @Date: 2021-07-08 09:09:21
 * @LastEditTime: 2021-07-21 17:31:32
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/interface/interface.ts
 */

export interface IConfig {}

export interface IUserInfo {
    id: number;
    name: string;
    email: string;
    cookie: string;
    permission: string[];
    created: number;
}
export enum ELiveStreamStatus {
    READY = "ready",
    ONLIVE = "onLive",
    END = "end",
    PAUSE = "pause",
}

// export enum ERegion{
//     Asia="Asia",
//     Europe="Europe",
//     NorthAmerica="NorthAmerica",
// }
export interface ILiveStream {
    id: number;
    name: string;
    subTitle:string;
    category:string;
    description:string;
    userId: number;
    userName: string;
    region:string;
    secret?: string;
    status: ELiveStreamStatus;
    duration: number; //second
    createTimeStamp: number;
    startTimeStamp: number;
    endTimeStamp: number;
    coverImgUrl:string;
    watched:number;
    rtmpLink?: string;
    originLiveM3u8Link?: string;
    cdnLiveM3u8Link?: string;
    originRecordM3u8Link?: string;
    cdnRecordM3u8Link?: string;
}

// export interface ILiveServerInfo{
//     deviceId:string,
//     ip:string,
//     ipInfo:IIpInfo,
//     heartBeatTimeStamp:number,
//     spaceTotal:number,
//     spaceFree:number,
//     status:"ON"|"DOWN"
// }

export interface ILiveServerInfo{
    deviceId:string,
    ip:string,
    ipInfo:IIpInfo,
    heartBeatTimeStamp:number,
    spaceTotal:number,
    spaceFree:number,
    status:"ON"|"DOWN"
}

export interface ICategory{
    id:number
    category:string
    subCategory:string
}

export interface IReqResult {
    status: number;
    data?: any;
    msg?: string;
}

export interface IIpInfo{
    region:string,
    continent:string
    country:string,
}

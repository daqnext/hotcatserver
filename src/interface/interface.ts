/*
 * @Author: your name
 * @Date: 2021-07-08 09:09:21
 * @LastEditTime: 2021-07-13 12:25:10
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

export enum ERegion{
    Asia="Asia",
    Europe="Europe",
    NorthAmerica="NorthAmerica",
}
export interface ILiveStream {
    id: number;
    name: string;
    subTitle:string;
    description:string;
    userId: number;
    userName: string;
    streamKey: string;
    liveServerAddress:string;
    status: ELiveStreamStatus;
    duration: number; //second
    createTimeStamp: number;
    startTimeStamp: number;
    endTimeStamp: number;
    trmpLink: string;
    originM3u8Link: string;
    cdnM3u8Link: string;
    coverImgUrl:string;
}

export interface ILiveServerInfo{
    ip:string,
    ipInfo:IIpInfo,
    heartBeatTimeStamp:number,
    deviceId:string,
    spaceTotal:number,
    spaceFree:number,
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
    region:ERegion,
    continent:string
    country:string,
}

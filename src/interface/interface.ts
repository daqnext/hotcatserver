/*
 * @Author: your name
 * @Date: 2021-07-08 09:09:21
 * @LastEditTime: 2021-07-08 17:21:40
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/interface/interface.ts
 */

export interface IConfig{
    
}


export interface IUserInfo {
    id:number;
    name:string;
    email:string;
    cookie:string;
    permission:string[];
    created:number;
}

export interface ILiveStream{
    id:number;
    name:string;
    userId:number;
    userName:string;
    streamKey:string;
    status:"ready"|"onLive"|"end"|"pause";
    duration:number //second
    createTimeStamp:number;
    startTimeStamp:number;
    endTimeStamp:number;
    trmpLink:string;
    originM3u8Link:string;
    cdnM3u8Link:string;
}
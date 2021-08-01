/*
 * @Author: your name
 * @Date: 2021-07-07 11:38:23
 * @LastEditTime: 2021-07-30 10:51:04
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/interface/user.ts
 */

export interface IUserGetEmailVCodeMsg{
    email:string
}

export interface IUserRegisterMsg  {
    userName: string;
    email: string;
    vCode:string;
    passwd: string;
    captcha: string;
    captchaId: string;
};

export interface IUserLoginMsg {
    email: string;
    passwd: string;
    captcha: string;
    captchaId: string;
}

export interface ICreateLivestreamMsg {
    streamName: string;
    subTitle: string;
    description: string;
    category: string;
    language:string;
    coverImgUrl: string;
    captcha: string;
    captchaId: string;
}

export interface IUpdateLivestreamMsg{
    streamId:number
    secret:string
    streamName: string;
    subTitle: string;
    description: string;
    category: string;
    language:string;
    coverImgUrl: string;
}

export interface IFinishLivestreamMsg{
    streamId:number
    secret:string
}

export interface IDeleteLivestreamMsg {
    streamId: number;
    secret: string;
}

export interface IDeleteCoverMsg{
    imgName:string
}

export interface IGetLivestreamMsg {
    id:number
}

export interface IFinishUploadMsg{
    id:number
}

export interface IQueryLivestreamMsg{
    limit: number;
    offset: number;
    status?:string;
    userId?:string;
    region?:string;
    category?:string;
    userName?:string;
}

export interface IGetVideoListMsg{
    lastIndexMap:{[key:string]:number}
    category:string[],
    isOnlyOnLive:boolean,
    count:number,
}

export interface ISearchVideoMsg{
    keyWords:string[],
}

export interface IStreamOnPublishMsg {
    app:string,
    swfurl:string,
    tcurl:string,
    pageurl:string,
    addr:string,
    clientid:string,
    call:string,
    name:string,
    type:string
}

export interface IStreamOnUnPublishMsg {
    app:string,
    swfurl:string,
    tcurl:string,
    pageurl:string,
    addr:string,
    clientid:string,
    call:string,
    name:string,
}

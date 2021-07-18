/*
 * @Author: your name
 * @Date: 2021-07-07 11:38:23
 * @LastEditTime: 2021-07-16 23:51:07
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
    coverImgUrl: string;
    captcha: string;
    captchaId: string;
}

export interface IDeleteLivestreamMsg {
    streamId: number;
    streamKey: string;
}

export interface IGetLivestreamMsg {
    limit: number;
    offset: number;
}

export interface IStreamOnPublishMsg {
    action: string;
    client_id: string;
    ip: string;
    vhost: string;
    app: string;
    tcUrl: string;
    stream: string;
    param: string;
}

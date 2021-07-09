/*
 * @Author: your name
 * @Date: 2021-07-07 11:38:23
 * @LastEditTime: 2021-07-09 11:19:47
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/interface/user.ts
 */

export type IUserRegisterMsg = {
    userName: string;
    email: string;
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

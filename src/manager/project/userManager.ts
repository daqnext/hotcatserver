/*
 * @Author: your name
 * @Date: 2021-07-07 10:47:59
 * @LastEditTime: 2021-07-25 13:31:29
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/manager/userManager.ts
 */

import moment from "moment";
import { config } from "../../config/conf";
import { logger } from "../../global";
import { IUserInfo } from "../../interface/interface";
import { IUserRegisterMsg } from "../../interface/msg";
import { userModel } from "../../model/userModel";
import { redisTool } from "../../redis/redisTool";
import { requestTool } from "../../utils/request";

//import crypto  from 'crypto';
const crypto = require("crypto");

const UserInfo_cookie_string = "UserInfo_";
class userManager {
    static UserLocalCache: { [key: string]: { user: IUserInfo; exTime: number } } = {};

    public static genMd5password(passwd) {
        return crypto.createHash("md5").update(passwd).digest("hex");
    }
    public static genCookie() {
        return crypto.randomBytes(16).toString("base64").slice(0, 16);
    }

    public static async createNewUser(registerInfo: IUserRegisterMsg): Promise<{ user: IUserInfo; errMsg: string }> {
        try {
            let user = await userModel.findOne<userModel>({
                where: { name: registerInfo.userName },
            });
            if (user != null) {
                return { user: null, errMsg: "user name already exist" };
            }

            user = await userModel.findOne<userModel>({ where: { email: registerInfo.email } });
            if (user != null) {
                return { user: null, errMsg: "email already exist" };
            }

            user = await userModel.create<userModel>({
                cookie: userManager.genCookie(),
                name: registerInfo.userName,
                email: registerInfo.email,
                password: userManager.genMd5password(registerInfo.passwd),
                created: moment.now(),
                permission: JSON.stringify([]),
            });

            return { user: user, errMsg: "" };
        } catch (error) {
            console.error("create new user error", error);
            return { user: null, errMsg: error };
        }
    }

    public static async deleteUser(id: number) {
        try {
            const number = await userModel.destroy({ where: { id: id } });
            if (number > 0) {
                return true;
            }
            return false;
        } catch (error) {
            console.error("delete user error", error, "id:", id);
            return false;
        }
    }

    public static async getUserByEmail(email: string): Promise<{ user: userModel; errMsg: string }> {
        try {
            let user = await userModel.findOne<userModel>({ where: { email: email } });
            if (user == null) {
                return { user: null, errMsg: "user not exist" };
            }
            return { user: user, errMsg: "" };
        } catch (error) {
            console.error("find user by email error", error);
            return { user: null, errMsg: error };
        }
    }

    public static async getUserById(id: number): Promise<{ user: IUserInfo; errMsg: string }> {
        try {
            let user = await userModel.findOne<userModel>({ where: { id: id } });
            if (user == null) {
                return { user: null, errMsg: "user not exist" };
            }
            return { user: user, errMsg: "" };
        } catch (error) {
            console.error("find user by id error", error);
            return { user: null, errMsg: error };
        }
    }

    public static async getUserByCookie(cookie: string): Promise<{ user: IUserInfo; errMsg: string }> {
        if (config.serverType === "center") {
            return await this.centerGetUserByCookie(cookie);
        } else {
            return await this.regionGetUserByCookie(cookie);
        }
    }

    public static async regionGetUserByCookie(cookie: string): Promise<{ user: IUserInfo; errMsg: string }> {
        //from localCache
        const nowTime = moment.now();
        let userInfo = userManager.UserLocalCache[cookie];
        if (userInfo && userInfo.exTime > nowTime) {
            return { user: userInfo.user, errMsg: "" };
        }

        //from redis
        const key = UserInfo_cookie_string + cookie;
        const result = await redisTool.getSingleInstance().redis.get(key);
        if (result) {
            let userInfo: IUserInfo = JSON.parse(result);
            //setToLocalCache
            userManager.UserLocalCache[cookie] = {
                user: userInfo,
                exTime: nowTime + 30000,
            };
            return { user: userInfo, errMsg: "" };
        }

        //from center
        let url = config.center_host + "/api/region/getuserinfo";
        let data = await requestTool.post(url, { cookie: cookie });
        console.log(data);

        if (data.status === 0) {
            const userInfo: IUserInfo = data.data;
            //setToLocalCache
            userManager.UserLocalCache[cookie] = {
                user: userInfo,
                exTime: nowTime + 30000,
            };

            //setToRedis
            let str = JSON.stringify(userInfo);
            redisTool.getSingleInstance().redis.set(key, str, "EX", 600);

            return { user: userInfo, errMsg: "" };
        }

        console.error("find user by cookie error", data.msg);
        return { user: null, errMsg: data.msg };
    }

    public static async centerGetUserByCookie(cookie: string): Promise<{ user: IUserInfo; errMsg: string }> {
        //from localCache
        const nowTime = moment.now();
        let userInfo = userManager.UserLocalCache[cookie];
        if (userInfo && userInfo.exTime > nowTime) {
            return { user: userInfo.user, errMsg: "" };
        }

        //from redis
        const key = UserInfo_cookie_string + cookie;
        const result = await redisTool.getSingleInstance().redis.get(key);
        if (result) {
            let userInfo: IUserInfo = JSON.parse(result);
            //setToLocalCache
            userManager.UserLocalCache[cookie] = {
                user: userInfo,
                exTime: nowTime + 30000,
            };
            return { user: userInfo, errMsg: "" };
        }

        //from db
        try {
            let user = await userModel.findOne<userModel>({ where: { cookie: cookie } });
            if (user == null) {
                return { user: null, errMsg: "user not exist" };
            }
            let userInfo: IUserInfo = {
                id: user.id,
                name: user.name,
                email: user.email,
                cookie: user.cookie,
                permission: user.permission,
                created: user.created,
            };

            //setToLocalCache
            userManager.UserLocalCache[cookie] = {
                user: userInfo,
                exTime: nowTime + 30000,
            };

            //setToRedis
            let str = JSON.stringify(userInfo);
            redisTool.getSingleInstance().redis.set(key, str, "EX", 600);

            return { user: userInfo, errMsg: "" };
        } catch (error) {
            console.error("find user by cookie error", error);
            return { user: null, errMsg: error };
        }
    }

    public static VerifyPasswd(passwdInput: string, passwdInDb: string): boolean {
        const passwdMd5 = this.genMd5password(passwdInput);
        if (passwdMd5 === passwdInDb) {
            return true;
        }
        return false;
    }
}

export { userManager };

/*
 * @Author: your name
 * @Date: 2021-07-07 11:34:52
 * @LastEditTime: 2021-07-09 08:58:58
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/controller/userController.ts
 */
import koa from "koa";
import router from "koa-router";
import { IUserInfo } from "../../../interface/interface";
import { IUserLoginMsg, IUserRegisterMsg } from "../../../interface/msg";
import { userManager } from "../../../manager/project/userManager";
import { Utils } from "../../../utils/utils";

class userController {
    public static init(Router: router) {
        let C = new userController();
        //config all the get requests
        Router.post("/api/user/register", C.userRegister);
        Router.post("/api/user/login", C.userLogin);

        //config all the post requests
        return C;
    }

    async userRegister(ctx: koa.Context, next: koa.Next) {
        const msg: IUserRegisterMsg = ctx.request.body;
        console.log(msg);
        //check captcha
        // const isCapOk=await captchaManager.Verity(msg.captchaId,msg.captcha)
        // if (!isCapOk) {
        //   ctx.body={
        //     status:1,
        //     data:null,
        //     msg:"Captcha error"
        //   }
        //   return
        // }

        //check email format
        if (!Utils.isEmailLegal(msg.email)) {
            ctx.body = {
                status: 1,
                data: null,
                msg: "Email format error",
            };
            return;
        }

        //check passwd format
        if (msg.passwd.length < 5 || msg.passwd.length > 20) {
            ctx.body = {
                status: 1,
                data: null,
                msg: "password length should be 5~20",
            };
            return;
        }

        const { user, errMsg } = await userManager.createNewUser(msg);
        if (
            user === null &&
            (errMsg === "user name already exist" || errMsg === "email already exist")
        ) {
            ctx.body = {
                status: 1,
                data: null,
                msg: errMsg,
            };
            return;
        }

        if (user === null && errMsg !== "") {
            ctx.body = {
                status: 1,
                data: null,
                msg: "something wrong. Please try again later.",
            };
            return;
        }

        const userInfo: IUserInfo = {
            id: user.id,
            name: user.name,
            email: user.email,
            cookie: user.cookie,
            permission: user.permission,
            created: user.created,
        };
        console.log(user);
        console.log(userInfo);

        ctx.body = {
            status: 0,
            data: userInfo,
        };
        return;
    }

    async userLogin(ctx: koa.Context, next: koa.Next) {
        const msg: IUserLoginMsg = ctx.request.body;
        console.log(msg);

        // check captcha
        // const isCapOk=await captchaManager.Verity(msg.captchaId,msg.captcha)
        // if (!isCapOk) {
        //   ctx.body={
        //     status:1,
        //     data:null,
        //     msg:"Captcha error"
        //   }
        //   return
        // }

        //check email format
        if (!Utils.isEmailLegal(msg.email)) {
            ctx.body = {
                status: 1,
                data: null,
                msg: "Email format error",
            };
            return;
        }

        //check passwd format
        if (msg.passwd.length < 5 || msg.passwd.length > 20) {
            ctx.body = {
                status: 1,
                data: null,
                msg: "password length should be 5~20",
            };
            return;
        }

        const { user, errMsg } = await userManager.getUserByEmail(msg.email);
        if (user === null && errMsg === "user not exist") {
            ctx.body = {
                status: 1,
                data: null,
                msg: errMsg,
            };
            return;
        }

        if (user === null && errMsg !== "") {
            ctx.body = {
                status: 1,
                data: null,
                msg: "something wrong. Please try again later.",
            };
            return;
        }

        if (!userManager.VerifyPasswd(msg.passwd, user.password)) {
            ctx.body = {
                status: 1,
                data: null,
                msg: "Password error",
            };
            return;
        }

        const userInfo: IUserInfo = {
            id: user.id,
            name: user.name,
            email: user.email,
            cookie: user.cookie,
            permission: user.permission,
            created: user.created,
        };

        ctx.body = {
            status: 0,
            data: userInfo,
        };
    }
}

module.exports = userController;

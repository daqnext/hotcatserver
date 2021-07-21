/*
 * @Author: your name
 * @Date: 2021-07-07 11:34:52
 * @LastEditTime: 2021-07-21 15:20:30
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/controller/userController.ts
 */
import koa from "koa";
import router from "koa-router";
import { IUserInfo } from "../../../interface/interface";
import { IUserGetEmailVCodeMsg, IUserLoginMsg, IUserRegisterMsg } from "../../../interface/msg";
import { auth } from "../../../manager/common/auth";
import { userManager } from "../../../manager/project/userManager";
import { Utils } from "../../../utils/utils";
import multer from "@koa/multer";
import fs from "fs";
import path from "path";
import { rootDIR } from "../../../global";
import randomString from "string-random";
import { resp } from "../../../utils/resp";
import { requestTool } from "../../../utils/request";
import { config } from "../../../config/conf";
import { emailVerifyManager } from "../../../manager/project/emailVerifyManager";

const upload = multer({
    limits: {
        fields: 10,
        files: 1,
        fileSize: 1 * 1024, // 1MB
    },
    fileFilter: (ctx, file, cb) => {
        let extName = path.extname(file.originalname);
        if (!Utils.filterFileExt(extName, [".png", ".jpg", ".jpeg", ".bmp", ".svg"])) {
            cb(null, false);
            cb(new Error("format error"));
        } else {
            cb(null, true);
        }
    },
});
class userController {
    public static init(Router: router) {
        let C = new userController();
        //config all the get requests
        Router.post("/api/user/register", C.userRegister);
        Router.post("/api/user/login", C.userLogin);
        Router.get("/api/user/userinfo",auth.ParseTokenMiddleware(),C.userGetUserInfo)
        Router.post("/api/user/getemailvcode",C.userGetEmailVcode)

        Router.post("/api/user/uploadavatar", auth.ParseTokenMiddleware(), C.handleUploadAvatar);

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

        const name = msg.userName.toLowerCase();
        if (
            name === "admin" ||
            name === "administrator" ||
            name === "finance" ||
            name === "contact"
        ) {
            ctx.body = {
                status: 1,
                data: null,
                msg: "user name already exist",
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

        //create user in cdn
        const cdnUrl = config.cdn_host + "/api/v1/admin/hotcat/createliveaccuser";
        console.log(cdnUrl);
        
        const sendData = {
            userName: user.name,
            id: user.id,
        };
        const cdnUserInfo=await requestTool.post(cdnUrl,sendData,{headers:{
            Accept:        "application/json",
		    Authorization: "Basic " + config.cdn_requestToken,
        }});
        if (cdnUserInfo.status!==0) {
            //delete created user
            await userManager.deleteUser(user.id)
            resp.send(ctx,1,null,"create cdn user error,please try later")
            return
        }
        
        console.log(cdnUserInfo);
        //console.log(user);
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

    async userGetUserInfo(ctx: koa.Context, next: koa.Next){
        const user: IUserInfo = ctx.state.user;
        resp.send(ctx,0,user,null)
    }

    async userGetEmailVcode(ctx: koa.Context, next: koa.Next){
        const msg: IUserGetEmailVCodeMsg = ctx.request.body;
        console.log(msg);
        
        const {success,err}=await emailVerifyManager.GenEmailVCode(msg.email)
        if (!success) {
            resp.send(ctx,1,null,err)
            return
        }
        resp.send(ctx,0)
    }

    async handleUploadAvatar(ctx: koa.Context, next: koa.Next) {
        try {
            await upload.single("avatar")(ctx, next);

            const imgInfo = Utils.sizeOfImg(ctx.file.buffer);
            if (imgInfo == null) {
                resp.send(ctx, 1, null, "unsupported file");
                return;
            }
            if (
                imgInfo.width < 100 ||
                imgInfo.width > 200 ||
                imgInfo.height < 100 ||
                imgInfo.height > 200
            ) {
                resp.send(ctx, 1, null, "image size error");
                return;
            }

            const user: IUserInfo = ctx.state.user;
            //let originName = path.normalize(ctx.file.originalname);
            //let extName = path.extname(originName);
            let uploadFileUrl = path.join("/public", "avatar", user.id+"");
            let saveFilePath = path.join(rootDIR, "../", uploadFileUrl);
            let dirName = path.dirname(saveFilePath);
            if (!fs.existsSync(dirName)) {
                fs.mkdirSync(path.dirname(saveFilePath));
            }
            fs.writeFileSync(saveFilePath, ctx.file.buffer);

            resp.send(ctx, 0, { url: uploadFileUrl });
        } catch (error) {
            if (error.message && error.message === "format error") {
                resp.send(ctx, 1, null, "file format error");
                return;
            }

            switch (error.code) {
                case "LIMIT_FILE_SIZE":
                    resp.send(ctx, 1, null, "File too large");
                    return;
                case "LIMIT_UNEXPECTED_FILE":
                    resp.send(ctx, 1, null, "unexpected field,upload error");
                    return;

                default:
            }
            resp.send(ctx, 1, null, "upload error");
            return;
        }
    }
}

module.exports = userController;

/*
 * @Author: your name
 * @Date: 2021-07-07 11:34:52
 * @LastEditTime: 2021-07-09 18:31:48
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/controller/userController.ts
 */
import koa from "koa";
import router from "koa-router";
import { IUserInfo } from "../../../interface/interface";
import { IUserLoginMsg, IUserRegisterMsg } from "../../../interface/msg";
import { auth } from "../../../manager/common/auth";
import { userManager } from "../../../manager/project/userManager";
import { Utils } from "../../../utils/utils";
import multer from "@koa/multer";
import fs from "fs";
import path from "path";
import { rootDIR } from "../../../global";
import randomString from "string-random";
import { resp } from "../../../utils/resp";

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
            let originName = path.normalize(ctx.file.originalname);
            let extName = path.extname(originName);
            let uploadFileUrl = path.join("/public", "avatar", user.id + extName);
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

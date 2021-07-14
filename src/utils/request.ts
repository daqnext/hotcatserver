/*
 * @Author: your name
 * @Date: 2021-07-09 12:49:05
 * @LastEditTime: 2021-07-09 15:05:06
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/utils/request.ts
 */

import axios, { AxiosResponse } from "axios";
import { IReqResult } from "../interface/interface";


class requestTool {
    static async get(url: string) {
        return this.send(url, {}, "GET");
    }

    static async post(url: string, data: any) {
        return this.send(url, data, "POST");
    }

    static async send(url: string, data = {}, type: "POST" | "GET" | "PUT" | "DELETE" = "GET") {
        let promise: Promise<AxiosResponse<IReqResult>> = null;
        switch (type) {
            case "GET":
                promise = axios.get(url, { params: data });
                break;
            case "POST":
                promise = axios.post(url, data);
                break;
            case "PUT":
                promise = axios.put(url, data);
                break;
            case "DELETE":
                promise = axios.delete(url, data);
                break;
        }

        const timeout = new Promise((resolve, reject) => {
            setTimeout(() => {
                reject("request time out");
            }, 8000);
        });

        const requestPromise = new Promise((resolve, reject) => {
            promise
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    //console.log(error);
                    reject(error);
                });
        });

        try {
            const result = await Promise.race([requestPromise, timeout]);
            return result as IReqResult;
        } catch (error) {
            console.log(error);
            // message.error(error.toString());
            return null;
        }
    }
}

export { requestTool };

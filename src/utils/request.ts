/*
 * @Author: your name
 * @Date: 2021-07-09 12:49:05
 * @LastEditTime: 2021-07-14 16:36:13
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/utils/request.ts
 */

import axios, { AxiosResponse,AxiosRequestConfig } from "axios";
import { IReqResult } from "../interface/interface";


class requestTool {
    static async get(url: string,requestConfig?:AxiosRequestConfig,requestTimeout:number=8000,) {
        return this.send(url, {}, "GET",requestConfig,requestTimeout);
    }

    static async post(url: string, data: any,requestConfig?:AxiosRequestConfig,requestTimeout:number=8000) {
        return this.send(url, data, "POST",requestConfig,requestTimeout);
    }

    static async send(url: string, data = {}, type: "POST" | "GET" | "PUT" | "DELETE" = "GET",requestConfig?:AxiosRequestConfig,requestTimeout:number=8000) {
        let promise: Promise<AxiosResponse<IReqResult>> = null;
        switch (type) {
            case "GET":
                promise = axios.get(url, requestConfig);
                break;
            case "POST":
                promise = axios.post(url, data,requestConfig);
                break;
            case "PUT":
                promise = axios.put(url, data,requestConfig);
                break;
            case "DELETE":
                promise = axios.delete(url,requestConfig);
                break;
        }

        const timeout = new Promise((resolve, reject) => {
            setTimeout(() => {
                reject("request time out");
            }, requestTimeout);
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

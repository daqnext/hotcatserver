/*
 * @Author: your name
 * @Date: 2021-08-02 15:58:38
 * @LastEditTime: 2021-08-03 13:01:39
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/manager/project/videoUploader.ts
 */

import ffmpeg from "fluent-ffmpeg";
import sftpClient from "ssh2-sftp-client";
import path from "path";
import fs from "fs";
import { IRemoteServerInfo } from "../../interface/interface";
import { Utils } from "../../utils/utils";
import { config } from "../../config/conf";
import { livestreamManager } from "./livestreamManager";
import { liveServerManager } from "./liveserverManager";

class remoteUploader {
    static transcodeVideo(videoPath: string, host: string, streamId: number, outputDir: string) {
        return new Promise<boolean>((resolve, reject) => {
            let infs = new ffmpeg();
            const a = 10;
            let transcode = infs.addInput(videoPath);
            transcode.outputOptions([
                // '-map 0:0',
                // '-map 0:1',
                // '-map 0:0',
                // '-map 0:1',
                // '-s:v:0 2160x3840',
                // '-c:v:0 libx264',
                // '-b:v:0 2000k',
                "-s:v 1280x720",
                "-c:v libx264",
                "-b:v 1024k",
                "-b:a 128k",
                // '-var_stream_map', '"v:0,a:0 v:1,a:1"',
                //'-master_pl_name master.m3u8',
                "-f hls",
                // "-segment_time 30",
                "-crf 25",
                "-max_muxing_queue_size 1024",
                "-hls_time 30",
                `-hls_base_url ${host}/record/${streamId}/`,
                "-hls_list_size 0",
                "-hls_segment_filename",
                `temp/hls/${streamId}/%d.ts`,
                // `${host}/record/${streamId}/%d.ts`,
                // ""
            ]);
            fs.mkdirSync(outputDir, { recursive: true });
            transcode.output(outputDir + "/index.m3u8");
            transcode.on("start", function (commandLine) {
                console.log("Spawned Ffmpeg with command: " + commandLine);
            });
            transcode.on("error", function (err, stdout, stderr) {
                console.log("An error occurred: " + err.message, err, stderr);
                resolve(false);
            });
            transcode.on("progress", function (progress) {
                console.log("Processing: " + progress.percent + "% done");
            });
            transcode.on("end", function (err, stdout, stderr) {
                console.log("Finished processing!" /*, err, stdout, stderr*/);
                resolve(true);
            });

            transcode.run();
        });
    }

    static async GetRemoteServerInfoByRegion(region:string): Promise<IRemoteServerInfo>{
        const {storageSeverAddress}=await liveServerManager.GetLiveServerByRegion(region)
        return await this.GetRemoteServerInfo(storageSeverAddress)
    }

    static async GetRemoteServerInfo(originLink: string): Promise<IRemoteServerInfo> {
        const urlInfo = new URL(originLink);
        //ip
        const rtmpHost = urlInfo.hostname;
        const ip = await Utils.getIp(rtmpHost);
        if (ip === null) {
            return null;
        }
        const serverIp = ip;
        //host
        const origin = urlInfo.origin;
        return {
            host: origin,
            ip: serverIp,
            port: config.rtmp_port,
            userName: config.rtmp_userName,
            password: config.rtmp_password,
        };
    }

    static async uploadFolderToRemote(localFolderPath: string, remoteFolderPath: string, remoteServerLoginInfo: IRemoteServerInfo):Promise<boolean> {
        let client = new sftpClient();

        try {
        await client.connect({
            host: remoteServerLoginInfo.ip,
            port: remoteServerLoginInfo.port,
            username: remoteServerLoginInfo.userName,
            password: remoteServerLoginInfo.password,
        });

       
            if (await client.exists(remoteFolderPath)) {
                await client.rmdir(remoteFolderPath, true);
            }
            await client.mkdir(remoteFolderPath);
            console.info("uploading.... :", localFolderPath);
            client.on("upload", (info) => {
                console.log(`Listener: Uploaded ${info.source}`);
            });
            const relt = await client.uploadDir(localFolderPath, remoteFolderPath);
            console.log(relt);
            client.end();
            return true
        } catch (error) {
            console.error(error);
            client.end();
            return false
        } 
        
    }
}

export { remoteUploader };

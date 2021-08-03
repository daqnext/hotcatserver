/*
 * @Author: your name
 * @Date: 2021-08-03 12:03:54
 * @LastEditTime: 2021-08-03 13:14:17
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/manager/project/sftpManager.ts
 */

import path from "path";
import sftpClient from "ssh2-sftp-client";
import { IRemoteServerInfo } from "../../interface/interface";

class sftpManager {
    static async UploadFolderToRemoteServer(localFolderPath: string, remoteFolderPath: string, remoteServerLoginInfo: IRemoteServerInfo) {
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
            return true;
        } catch (error) {
            console.error(error);
            client.end();
            return false;
        }
    }

    static async UploadBufferToRemoteServer(data: string | Buffer , remoteFilePath: string, remoteServerLoginInfo: IRemoteServerInfo){
        let client = new sftpClient();

        try {
            await client.connect({
                host: remoteServerLoginInfo.ip,
                port: remoteServerLoginInfo.port,
                username: remoteServerLoginInfo.userName,
                password: remoteServerLoginInfo.password,
            });

            const folderPath=path.dirname(remoteFilePath)
            if (! await client.exists(folderPath)) {
                await client.mkdir(folderPath,true);
            }
            

            await client.put(data,remoteFilePath,{
                writeStreamOptions: {
                  flags: 'w',  // w - write and a - append
                  encoding: null, // use null for binary files
                  mode: 0o777, // mode to use for created file (rwx)
                  autoClose: true // automatically close the write stream when finished
              }})
            client.end();
            return true;
        } catch (error) {
            console.error(error);
            client.end();
            return false;
        }
    }

    static async UploadFileToRemoteServer(localFilePath: string, remoteFilePath: string, remoteServerLoginInfo: IRemoteServerInfo) {
        let client = new sftpClient();

        try {
            await client.connect({
                host: remoteServerLoginInfo.ip,
                port: remoteServerLoginInfo.port,
                username: remoteServerLoginInfo.userName,
                password: remoteServerLoginInfo.password,
            });

            const folderPath=path.dirname(remoteFilePath)
            await client.mkdir(folderPath);

            await client.fastPut(localFilePath,remoteFilePath,{
                writeStreamOptions: {
                  flags: 'w',  // w - write and a - append
                  encoding: null, // use null for binary files
                  mode: 0o777, // mode to use for created file (rwx)
                  autoClose: true // automatically close the write stream when finished
              }})
            client.end();
            return true;
        } catch (error) {
            console.error(error);
            client.end();
            return false;
        }
    }

    static async DeleteRemoteServerFile(remoteFilePath: string, remoteServerLoginInfo: IRemoteServerInfo) {
        let client = new sftpClient();
        try {
            await client.connect({
                host: remoteServerLoginInfo.ip,
                port: remoteServerLoginInfo.port,
                username: remoteServerLoginInfo.userName,
                password: remoteServerLoginInfo.password,
            });

            if (await client.exists(remoteFilePath)) {
                await client.delete(remoteFilePath, true);
            }
            client.end();
            return true;
        } catch (error) {
            console.error(error);
            client.end();
            return false;
        }
    }

    static async DeleteRemoteServerFolder(remoteFolderPath: string, remoteServerLoginInfo: IRemoteServerInfo) {
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
            client.end();
            return true;
        } catch (error) {
            console.error(error);
            client.end();
            return false;
        }
    }
}

export { sftpManager };

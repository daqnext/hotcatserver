/*
 * @Author: your name
 * @Date: 2021-07-21 09:11:47
 * @LastEditTime: 2021-07-21 13:03:29
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/manager/project/liveserverManager.ts
 */

import { regionServerConfigModel } from "../../model/regionServerConfigModel";

class liveServerManager {
    static regionLiveServerMap:{[key:string]:{storageSeverAddress:string,rtmpServerAddress:string}}={}

    static async updateLiveServerMap(){
        try {
            const result = await regionServerConfigModel.findAll()
            //console.log(result);
            const regionServerConfig: {[key:string]:{storageSeverAddress:string,rtmpServerAddress:string}} = {}
            for (let i = 0; i < result.length; i++) {
                regionServerConfig[result[i].region]={
                    storageSeverAddress:result[i].storageServerAddress,
                    rtmpServerAddress:result[i].rtmpServerAddress,
                }
            }
            this.regionLiveServerMap=regionServerConfig
            console.log(this.regionLiveServerMap);
        } catch (error) {
            console.error("updateLiveServerMap error:",error);
        }
    }
    
    static GetLiveServerByRegion(region:string):{storageSeverAddress:string,rtmpServerAddress:string}{
        if (this.regionLiveServerMap[region]) {
            return this.regionLiveServerMap[region]
        }
        return {
            storageSeverAddress:"https://us_west_1c_s.hotcat.live",
            rtmpServerAddress:"rtmp://us_west_1c_r.hotcat.live"
        }
    }
}

export { liveServerManager };
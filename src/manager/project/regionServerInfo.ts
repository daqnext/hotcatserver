/*
 * @Author: your name
 * @Date: 2021-07-12 10:27:43
 * @LastEditTime: 2021-07-12 10:40:00
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/manager/project/regionServerInfo.ts
 */

const masterTokenKey="MasterToken"

class regionServerInfo{
    static isRegionMaster=false
    static regionName="unknown"

    static SetRegion(regionName:string){
        this.regionName=regionName
    }

    static ApplyForRegionMasterToken(){

    }

    static KeepRegionMasterToken(){

    }

    static ScrambleForMasterToken():boolean{
        return true
    }

    static RegionMasterHeartBeat(){

    }

    static RegionMasterLogin(){
        
    }
    
}
export {regionServerInfo}
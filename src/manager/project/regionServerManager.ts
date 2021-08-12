/*
 * @Author: your name
 * @Date: 2021-07-12 09:59:08
 * @LastEditTime: 2021-08-05 10:37:23
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/manager/project/regionServerManager.ts
 */

import { redisTool } from "../../redis/redisTool";

const MasterToken = "MasterToken";

class regionMasterManager {
    static isRegionMaster=false

    static async ApplyForRegionMaster(){
        if (this.isRegionMaster == true) {
            return
        }
    
        //争夺MasterToken
        const success = await this.ScrambleForMasterToken()
        if (success == false) {
            return
        }

    
        //apply success,keep token
        this.isRegionMaster = true
        this.KeepRegionMasterToken()
    }

    static KeepRegionMasterToken() {
        if(this.isRegionMaster == false) {
            return
        }
    
        //keep MasterToken exist
        redisTool.getSingleInstance().redis.expire(MasterToken,20)
    }
    
    static async ScrambleForMasterToken():Promise<boolean> {
        //先从regionRedis get
        const str = await redisTool.getSingleInstance().redis.get(MasterToken)
        if (str===null) {
            const result = await redisTool.getSingleInstance().redis.incr(MasterToken)
            if (result==1) {
                redisTool.getSingleInstance().redis.expire(MasterToken,20)
                return true
            }
        }

        return false
        
    }
    
}

export { regionMasterManager};

/*
 * @Author: your name
 * @Date: 2021-07-23 10:55:08
 * @LastEditTime: 2021-07-23 10:58:45
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/manager/project/languageManager.ts
 */

import { config } from "../../config/conf";
import { languageConfigModel } from "../../model/languageConfigModel";
import { requestTool } from "../../utils/request";

class languageManager {
    static languageMap: { [key: string]: string } = null;
    static async regionGetAllLanguage() {
        if (this.languageMap === null) {
            await this.regionRefreshLanguage()
        }
        return { languageMap: this.languageMap, errMsg: "" };
    }

    static async centerGetAllLanguage() {
        if (this.languageMap === null) {
            await this.centerRefreshLanguage();
        }
        return { languageMap: this.languageMap, errMsg: "" };
    }

    static async centerRefreshLanguage() {
        try {
            console.log("get language");
            
            const language = await languageConfigModel.findAll();
            console.log(language);
            
            let tempLanguageMap: { [key: string]: string } = {};
            for (let i = 0; i < language.length; i++) {
                let lang = language[i].language;
                tempLanguageMap[lang]=language[i].localName
            }
            this.languageMap = tempLanguageMap;
        } catch (error) {
            console.error("query language error", error);
        }
    }

    static async regionRefreshLanguage() {
        console.log("get language");
        let url=config.center_host + "/api/region/getlanguage"
        let data = await requestTool.get(url);
        console.log(data);
        
        if (data.status == 0) {
            this.languageMap = data.data;
        }
    }
}

export { languageManager };

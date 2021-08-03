/*
 * @Author: your name
 * @Date: 2021-07-12 12:00:35
 * @LastEditTime: 2021-08-03 11:21:35
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/manager/project/ipRegionInfo.ts
 */
import ip2loc from "ip2location-nodejs";
import fs from "fs";
import csvParse from "csv-parse/lib/sync";
import path from "path";
import { logger, rootDIR } from "../../global";
import { IIpInfo } from "../../interface/interface";
import { regionMapConfigModel } from "../../model/regionMapConfigModel";

class ipRegionInfo {
    static countryToContinentMap: { [key: string]: string } = {}; //country => continent
    static areaToRegionMap: { [key: string]: string } = {}; // area(country or continent) => region

    static init() {
        const binPath = path.join(rootDIR, "../", "ipData", "IP2LOCATION-LITE-DB1.BIN");
        ip2loc.IP2Location_init(binPath);

        //ip country-continent csv
        const csvPath = path.join(rootDIR, "../", "ipData", "IP2LOCATION-CONTINENT-ENGLISH.CSV");
        const csvStr = fs.readFileSync(csvPath, "utf8");
        const records = csvParse(csvStr, {
            columns: true,
            skip_empty_lines: true,
        });
        for (const value of records) {
            this.countryToContinentMap[value.country_alpha2_code] = value.continent;
        }
    }

    static async updateAreaToRegionMap() {
        try {
            const result = await regionMapConfigModel.findAll();
            //console.log(result);
            const aToRMap: { [key: string]: string } = {};
            for (let i = 0; i < result.length; i++) {
                aToRMap[result[i].areaName] = result[i].region;
            }
            this.areaToRegionMap = aToRMap;
            console.log(this.areaToRegionMap);
        } catch (error) {
            console.error("updateAreaToRegionMap error:", error);
        }
    }

    static getRegionByArea(areaName:string){
        let region: string = this.areaToRegionMap[areaName];
        if (region === null||region === undefined || region === "") {
            region = "us-west-1c"  
        }
        return region
    }
    

    static getIpInfo(ip: string): IIpInfo {
        const countryCode = ip2loc.IP2Location_get_country_short(ip);
        if (countryCode === "-" || countryCode === "?") {
            return {
                region: "us-west-1c",
                continent: "unknown continent",
                country: "unknown country",
            };
        }

        const countryName = ip2loc.IP2Location_get_country_long(ip);
        //console.info(countryName)
        const continent = this.countryToContinentMap[countryCode] ? this.countryToContinentMap[countryCode] : "unknown";
        //console.info(continent)
        //console.info(this.areaToRegionMap)
        let region: string = this.areaToRegionMap[countryName];
        //console.info(region)
        if (region === null||region === undefined || region === "") {
            region = this.areaToRegionMap[continent];   
        }
        //console.info(region)
        if (region === null ||region === undefined|| region === "") {
            region = "us-west-1c";
        }
        

        return {
            region: region,
            continent: continent,
            country: countryName,
        };
    }
}
export { ipRegionInfo };

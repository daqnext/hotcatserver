/*
 * @Author: your name
 * @Date: 2021-07-12 12:00:35
 * @LastEditTime: 2021-07-13 10:22:21
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/manager/project/ipRegionInfo.ts
 */
import ip2loc from "ip2location-nodejs";
import fs from "fs";
import csvParse from "csv-parse/lib/sync";
import path from "path";
import { rootDIR } from "../../global";
import { ERegion, IIpInfo } from "../../interface/interface";

class ipRegionInfo {
    static countryMap: { [key: string]: string } = {};
    static continentRegionMap: { [key: string]: ERegion } = {
        Asia: ERegion.Asia,
        Oceania: ERegion.NorthAmerica,
        Africa: ERegion.NorthAmerica,
        Europe: ERegion.Europe,
        "North America": ERegion.NorthAmerica,
        "South America": ERegion.NorthAmerica,
        unknown: ERegion.NorthAmerica,
    };

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
            this.countryMap[value.country_alpha2_code] = value.continent;
        }
    }

    static getIpInfo(ip: string): IIpInfo {
        const countryCode = ip2loc.IP2Location_get_country_short(ip);
        if (countryCode === "-" || countryCode === "?") {
            return {
                region: ERegion.NorthAmerica,
                continent: "unknown continent",
                country: "unknown country",
            };
        }

        const countryName = ip2loc.IP2Location_get_country_long(ip);
        const continent = this.countryMap[countryCode] ? this.countryMap[countryCode] : "unknown";
        const region = this.continentRegionMap[continent];

        return {
            region: region,
            continent: continent,
            country: countryName,
        };
    }
}
export { ipRegionInfo };

import {csv} from 'd3-fetch'

export const ALL_RACES = "All races"
export const AMERICAN_INDIAN = "American Indian"
export const ASIAN = "Asian"
export const BLACK = "Black"
export const OFFENSES = "Offenses"
export const WHITE = "White"
export const YEAR = "Year"
export const TYPE_OF_CRIME = "Type Of Crime"
export const TOTAL_CRIME = "Total Crime"

const processRecord = (record) => {
    const result = {}
    result[ALL_RACES] = parseInt(record[ALL_RACES].split(",").join(""))
    result[AMERICAN_INDIAN] = parseInt(record[AMERICAN_INDIAN].split(",").join(""))
    result[ASIAN] = parseInt(record[ASIAN].split(",").join(""))
    result[WHITE] = parseInt(record[WHITE].split(",").join(""))
    result[BLACK] = parseInt(record[BLACK].split(",").join(""))
    return result
}

export const processOverviewData = (data) => {
    const dataByYear = {}
    data.forEach((item, i) => {
        if (item[ALL_RACES] == "NA") {
            return
        }
        if (!dataByYear[item[YEAR]]) {
            dataByYear[item[YEAR]] = {}
            // dataByYear[item[YEAR]][TYPE_OF_CRIME] = []
        }

        dataByYear[item[YEAR]][item[OFFENSES]] = processRecord(item)

        /*
        if (item[OFFENSES] == "All offenses") {
            dataByYear[item[YEAR]][TOTAL_CRIME] = parseInt(item[ALL_RACES].split(",").join(""))
        } else {
            dataByYear[item[YEAR]][TYPE_OF_CRIME].push(processRecord(item))
        }
         */
    })
    return dataByYear
}

const colors = [
    "#FF0000", "#00E0E0", "#0000FF", "#E000E0", "#FF00FF", "#00FFFF", "#800000",
    "#00A000", "#0000A0", "#A0A000", "#A000A0", "#00A0A0", "#A0A0A0", "#E00000",
    "#006000", "#000060", "#606000", "#600060", "#006060", "#606060", "#A00000",
    "#008000", "#000080", "#808000", "#800080", "#008080", "#808080", "#C00000",
    "#00C000", "#0000C0", "#C0C000", "#C000C0", "#00C0C0", "#C0C0C0","#400000",
    "#004000", "#000040", "#404000", "#400040", "#004040", "#404040", "#200000",
    "#002000", "#000020", "#202000", "#200020", "#002020", "#202020", "#600000",
    "#00E000", "#0000E0", "#E0E000", "#FFFF00", "#00FF00", "#E0E0E0", "#000000"
    ]

export const processCrimeCategories = (data) => {
    const categories = []
    const foundAlready = {
        "All offenses": 1,
        "Rape": 1,
        "Sex offenses": 1,
        "Violent Crime Index": 1
    }
    data.forEach((item, i) => {
        if (foundAlready[item[OFFENSES]]) {
            return
        }
        categories.push({name: item[OFFENSES], color: colors[i]})
        foundAlready[item[OFFENSES]] = 1
    })
    return categories
}

export async function CrimeDataLoader(url) {
    const crimeData = await csv(url)
    // const processedCrimeData = processData(crimeData)
    return crimeData
}
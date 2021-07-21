import {stack} from 'd3'

import {csv} from 'd3-fetch'

export const ALL_RACES = "ALL"
export const ASIAN_PACIFIC_ISLANDER = "ASIAN / PACIFIC ISLANDER"
export const BLACK = "BLACK"
export const OFFENSE = "Offense"
export const WHITE = "WHITE"
export const HISPANIC = "HISPANIC"
export const RACE = "Race"
export const ARREST_DATE = "ArrestDate"
export const COUNT = "Count"

const processRace = (crimeByRace, record) => {
    const black = record[RACE] == BLACK ? parseInt(record[COUNT]) : 0
    const hispanic = record[RACE] == HISPANIC ? parseInt(record[COUNT]) : 0
    const white = record[RACE] == WHITE ? parseInt(record[COUNT]) : 0
    const asian = record[RACE] == ASIAN_PACIFIC_ISLANDER ? parseInt(record[COUNT]) : 0
    crimeByRace['ALL'] += black + hispanic + white + asian
    crimeByRace['ASIAN / PACIFIC ISLANDER'] += asian
    crimeByRace['BLACK'] += black
    crimeByRace['HISPANIC'] += hispanic
    crimeByRace['WHITE'] += white
    return crimeByRace
}

const processRecord = (crimeStats, record) => {
    const crime = record[OFFENSE]
    if (!(crime in crimeStats)) {
        crimeStats[crime] = {
            "ALL": 0,
            "WHITE": 0,
            "BLACK": 0,
            "HISPANIC": 0,
            "ASIAN / PACIFIC ISLANDER": 0
        }
    }
    const crimeByRace = crimeStats[crime]
    crimeStats[crime] = processRace(crimeByRace, record)
    return crimeStats
}

const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
]

export const getNextMonthIndex = (index) => {
    if (index >= (months.length - 1) ) {
        return 0
    }else{
        return index++
    }
}


export const processOverviewData = (data) => {
    const crimeByMonth = {}
    data.forEach((item, i) => {
        const monthIndex = item[ARREST_DATE].split('/')[0]
        const year = item[ARREST_DATE].split('/')[2]
        const month = year + "-" + monthIndex
        if (!(month in crimeByMonth)) {
            const crimeStats = {}
            crimeByMonth[month] = crimeStats
        }
        const crimeStats = crimeByMonth[month]
        crimeByMonth[month] = processRecord(crimeStats, item)
    })

    return crimeByMonth
}

export const processCrimeByMonth = (crimeCategories, data) => {
    const totalCrimeByMonth = {}
    Object.keys(data).forEach((date) => {
        let all = 0
        let asian = 0
        let black = 0
        let hispanic = 0
        let white = 0
        crimeCategories.forEach((category) => {
            const monthlyData = data[date][category.name]
            asian += monthlyData[ASIAN_PACIFIC_ISLANDER]
            black += monthlyData[BLACK]
            hispanic += monthlyData[HISPANIC]
            white += monthlyData[WHITE]
        })
        totalCrimeByMonth[date] = {
            'ALL': (asian + black + hispanic + white),
            'ASIAN / PACIFIC ISLANDER': asian,
            'BLACK': black,
            'HISPANIC': hispanic,
            'WHITE': white
        }
    })
    return totalCrimeByMonth
}

export const processDailyCrimesMap = (data) => {
    const dailyCrimeByMonth = {}
    data.forEach((item, i) => {
        const monthIndex = item[ARREST_DATE].split('/')[0]
        const year = item[ARREST_DATE].split('/')[2]
        const month = year + "-" + monthIndex
        if (!(month in dailyCrimeByMonth)) {
            dailyCrimeByMonth[month] = {}
        }
        if (!(item[ARREST_DATE] in dailyCrimeByMonth[month])) {
            dailyCrimeByMonth[month][item[ARREST_DATE]] = {
                'ALL': 0,
                'ASIAN / PACIFIC ISLANDER': 0,
                'BLACK': 0,
                'HISPANIC': 0,
                'WHITE': 0
            }
        }


        const asian = item[RACE] == ASIAN_PACIFIC_ISLANDER ? parseInt(item[COUNT]) : 0
        const black = item[RACE] == BLACK ? parseInt(item[COUNT]) : 0
        const hispanic = item[RACE] == HISPANIC ? parseInt(item[COUNT]) : 0
        const white = item[RACE] == WHITE ? parseInt(item[COUNT]) : 0
        const offenses = dailyCrimeByMonth[month][item[ARREST_DATE]]
        offenses['ALL'] +=  (asian + black + hispanic + white)
        offenses['ASIAN / PACIFIC ISLANDER'] += asian
        offenses['BLACK'] += black
        offenses['HISPANIC'] += hispanic
        offenses['WHITE'] += white
    })
    return dailyCrimeByMonth
}

export const processDailyData = (data) => {
    const crimeCategories = processCrimeCategories(data)
    const dailyCrimeByMonth = {}
    data.forEach((item, i) => {
        const monthIndex = item[ARREST_DATE].split('/')[0]
        const year = item[ARREST_DATE].split('/')[2]
        const month = year + "-" + monthIndex
        if (!(month in dailyCrimeByMonth)) {
            const crimeStats = {}
            dailyCrimeByMonth[month] = crimeStats
        }
        crimeCategories.forEach(function(crimeCategory) {
            if (!(crimeCategory.name in dailyCrimeByMonth[month])) {
                const name = crimeCategory.name
                dailyCrimeByMonth[month][crimeCategory.name] = []
            }
            let offenses = dailyCrimeByMonth[month][crimeCategory.name]
            if (offenses.length == 0 || offenses[(offenses.length - 1)] != item[ARREST_DATE]) {
                offenses.push({
                    'ARREST_DATE': item[ARREST_DATE],
                    'ALL': 0,
                    'ASIAN / PACIFIC ISLANDER': 0,
                    'BLACK': 0,
                    'HISPANIC': 0,
                    'WHITE': 0
                })
            }
        })
        const asian = item[RACE] == ASIAN_PACIFIC_ISLANDER ? parseInt(item[COUNT]) : 0
        const black = item[RACE] == BLACK ? parseInt(item[COUNT]) : 0
        const hispanic = item[RACE] == HISPANIC ? parseInt(item[COUNT]) : 0
        const white = item[RACE] == WHITE ? parseInt(item[COUNT]) : 0
        const offenses = dailyCrimeByMonth[month][item[OFFENSE]]
        const offense = offenses[(offenses.length - 1)]

        offense['ALL'] +=  (asian + black + hispanic + white)
        offense['ASIAN / PACIFIC ISLANDER'] += asian
        offense['BLACK'] += black
        offense['HISPANIC'] += hispanic
        offense['WHITE'] += white
    })

    return dailyCrimeByMonth
}

const colors = [
    "#FF0000", "#00E0E0", "#4682b4", "#E000E0", "#FF00FF", "#9393cf", "#800000",
    "#006000", "#FF0060", "#606000", "#600060", "#006060", "#606060", "#A00000",
    "#00A000", "#0000A0", "#A0A000", "#A000A0", "#00A0A0", "#A0A0A0", "#E00000",
    "#008000", "#000080", "#808000", "#800080", "#008080", "#808080", "#C00000",
    "#00C000", "#0000C0", "#C0C000", "#C000C0", "#00C0C0", "#C0C0C0","#400000",
    "#004000", "#F000FF", "#404000", "#400040", "#004040", "#404040", "#200000",
    "#002000", "#000020", "#202000", "#200020", "#002020", "#202020", "#600000",
    "#00E000", "#0000E0", "#E0E000", "#FFFF00", "#00FF00", "#E0E0E0", "#000000"
    ]

export const processCrimeCategories = (data) => {
    const categories = []
    const foundAlready = {}
    data.forEach((item, i) => {
        if (foundAlready[item[OFFENSE]]) {
            return
        }
        categories.push({name: item[OFFENSE], color: colors[i]})
        foundAlready[item[OFFENSE]] = 1
    })
    return categories
}

export async function NycCrimeDataLoader(url) {
    const crimeData = await csv(url)
    return crimeData
}
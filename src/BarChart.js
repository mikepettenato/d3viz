import {stack} from 'd3'
import {axisLeft, axisBottom} from 'd3-axis'
import {scaleBand, scaleLinear, scaleOrdinal, scaleQuantize, scaleQuantile, scaleSqrt} from 'd3-scale'
import {select, selectAll} from 'd3-selection'
import {ALL_RACES, ARREST_DATE, ASIAN_PACIFIC_ISLANDER, BLACK, HISPANIC, WHITE} from "./NycCrimeDataLoader"

const margin = {
    top: 100,
    right: 50,
    bottom: 50,
    left: 50
}

const findYDomain = (crimeCategories) => {
    let max = 0;
    let min;
    Object.keys(crimeCategories).forEach((date) => {
        const all = crimeCategories[date][ALL_RACES]
        if (!min || all < min) {
            min = all
        }
        if (all > max) {
            max = all
        }
    })
    return [0, parseInt(max)]
}


const processCrimeByMonth = (crimeCategories, data) => {
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

const findKey = (elemYearId, elemMonthId) => {
    const year = select(elemYearId).text()
    const month = select(elemMonthId).text()
    return `${year}-${month}`
}

const chart_annotations = {
    '2019-11' : [
        '11/17/2019: First Reported Case of COVID-19 in Hubei Provenance, China'
    ],
    '2019-12' : [
        '12/31/2019: 44 cases of COVID-19 in Wuhan, China'
    ],
    '2020-1' : [
        "1/11/2020: China reports First COVID-19 death",
        "1/21/2020: First confirmed COVID-19 case in the U.S.",
        "1/30/2020: W.H.O. designates COVID-19 a Public-Health Emergency"
        ],
    '2020-2' : ["2/29/2020: First reported COVID-19 death in the U.S."],
    '2020-3' : [
        "3/7/2020: NYC State of Emergency due to COVID-19",
        "3/1/2020: First COVID-19 case in NY",
        "3/16/2021: NYC public schools close"
        ],
    '2020-4' : ["4/10/2020: NY State records more COVID-19 cases than any other country (other than U.S.)"],
    '2020-5' : ["5/15/2020: Governor Cuomo allows drive-in theaters, ", "landscaping, low-risk recreational activities to reopen"],
    '2020-6' : [
        '6/24/2020: Quarantine Restrictions on Travelers Arriving in NY',
        '6/8/2020: NYC begins phase 1 reopening',
        '6/22/2020: NYC begins phase 2 reopening'
        ],
    '2020-7' : ['7/24/2020: NYC reports 227,517 COVID-19 cases and 22,934 deaths to date'],
    '2020-8' : [
        '10/1/2020: NYC middle and high schools begin in-person learning',
        '10/5/2020: NYC reports 252,000 COVID-19 cases and 23,861 deaths to date'
    ],
    '2020-9' : [
        '9/8/2020: Sheriff deputies begin stopping buses headed to ',
        'Port Authority from hot spots, requiring quarantine forms to be signed',
        '9/9/2020: Malls in NYC reopen at 50% capacity',
        '9/16/2020: Mayor de Blasio furloughs his City Hall staff, including himself'
    ],
    '2020-11' :[
        '11/19/2020: NYC schools switch to all-remote',
        '11/21/2020: Restrictions on indoor',
        'dining are renewed in NYC'
    ],
    '2021-2': [
        '2/11/2021: Restaurants reopen',
        'indoor dining at 25% capacity',
        '2/14/2021: New Yorkers with',
        'underlying conditions become',
        'eligible for COVID-19 vaccine'
    ]
}

const clearAnnotations = (svg) => {
    svg.selectAll("g.annotations").remove()
}

const drawAnnotations = (svg, date, x, y) => {
    clearAnnotations(svg)
    let numberOfAnnotations = 0
    if (date in chart_annotations) {
        numberOfAnnotations = chart_annotations[date].length
    }
    if ((date in chart_annotations)) {
        const annotations = svg.append("g")
        annotations
            .attr("class", "annotations")
            .attr("transform", `translate(${x}, ${y-13*numberOfAnnotations})`)
        annotations.selectAll("text")
            .data(chart_annotations[date])
            .enter()
            .append("text")
            .attr("y", (d, i) => i*12)
            .attr("font-weight", 700)
            .style('font-size', 9)
            .style("fill", "darkorange")
            .text((d, i) => chart_annotations[date][i])
    }

}

export const highlightBar = (svgElement, elemYearId, elemMonthId) => {
    const key = findKey(elemYearId, elemMonthId)
    const svg = select(svgElement)
    let x
    let y
    svg.selectAll("rect")
        .transition()
        .attr("opacity", (d, i, elements) => {
            if (key == d.data[ARREST_DATE]) {
                x = select(elements[i]).attr("x")
                y = select(elements[i]).attr("y")
                return 1
            }else{
                return 0.1
            }
        })

    drawAnnotations(svg, key, x, y)

}

const getCategories = (crimeCategories) => {
    const categories = []
    crimeCategories.forEach(category => {
        categories.push(category.name)
    })
    return categories
}

const getCategoryColors = (crimeCategories) => {
    const colors = []
    crimeCategories.forEach(category => {
        colors.push(category.color)
    })
    return colors
}

const processedDataForStackedBarChart = (totalCrimeByMonth, overviewData, crimeCategories) => {
    const data = []
    Object.keys(totalCrimeByMonth).forEach(date => {
        const record = {}
        record[ARREST_DATE] = date
        crimeCategories.forEach(category => {
            const crimeForCategory = overviewData[date][category][ALL_RACES]
            record[category] = crimeForCategory
        })
        data.push(record)
    })
    return data
}

const createLegend = (svg, categories, colors, width, margin) => {
    const categoryMap = {}
    categories.forEach( (category, i) => {
        categoryMap[category] = colors[i]
    })

    const legend = svg.append("g")
    legend.attr("transform", `translate(${width - margin.left - 75}, ${margin.top/3})`)
    legend.selectAll("circle")
        .data(categories)
        .enter()
        .append("circle")
        .attr("cx", 0)
        .attr("cy", (d, i) => i*16)
        .attr("r", 5)
        .style("fill", (d) => categoryMap[d])
    legend.selectAll("text")
        .data(categories)
        .enter()
        .append("text")
        .attr("x", 9)
        .attr("y", (d, i) => i*16)
        .text((d) => d)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("fill", (d) => categoryMap[d])
        .style("font-size", 10)

}

const prePandemicMonths = [
    '2019-1', '2019-2', '2019-3', '2019-4', '2019-5', '2019-6',
    '2019-7', '2019-8', '2019-9', '2019-10', '2019-11',
    '2019-12', '2020-1', '2020-2'
]
const createPrepandemicAnnotations = (svg, locations) => {
    const prepandemicAnnotations = svg.append("g")
    prepandemicAnnotations.selectAll("circle")
        .data(prePandemicMonths)
        .enter()
        .append("circle")
        .attr("cx", d => {
            return (locations[d]['x'] + 15)
        })
        .attr("cy", d=> locations[d]['y']-5)
        .attr("r", 5)
        .style("fill", 'limegreen')
    prepandemicAnnotations
        .append("circle")
        .attr("cx", margin.left+15)
        .attr("cy", margin.top/2)
        .attr("r", 5)
        .style("fill", 'limegreen')
    prepandemicAnnotations
        .append("text")
        .attr("x", margin.left+30)
        .attr("y", margin.top/2)
        .text("Pre-pandemic Months")
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("fill", 'limegreen')
        .style("font-size", 12)
        .style('font-weight', 700)

}

export const BarChart = (svgElement, tooltip, crimeCategories, overviewData, totalCrimeByMonth, elemYearId, elemMonthId) => {

    const key = findKey(elemYearId, elemMonthId)

    const svg = select(svgElement)

    const width = svg.attr("width")
    const height = svg.attr("height")

    let dates = []

    Object.keys(totalCrimeByMonth).forEach((date) => {
        dates.push(date)
    })

    dates.sort((s1, s2) => {
        const s1Date = s1.split("-")
        const s1Year = s1Date[0]
        let s1Month = s1Date[1]
        if (s1Month.length == 1) {
            s1Month = "0"+s1Month
        }
        const s2Date = s2.split("-")
        const s2Year = s2Date[0]
        let s2Month = s2Date[1]
        if (s2Month.length == 1) {
            s2Month = "0"+s2Month
        }
        const val1 = parseInt(s1Year + s1Month)
        const val2 = parseInt(s2Year + s2Month)
        return val1 - val2

    })

    const xAxis = scaleBand()
        .domain(dates)
        .range([margin.left, (width - margin.left)])
        .padding(0.1)

    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(axisBottom(xAxis))
        .selectAll("text")
            .attr("transform", "rotate(-45)")
            .attr("x", (d, i) => {
               return -1*(d.length + 15)
            })

    const yDomain = findYDomain(totalCrimeByMonth)

    const yAxis = scaleLinear()
        .domain(yDomain)
        .range([(height - margin.bottom), margin.top])

    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(axisLeft().scale(yAxis))

    // show the (single) bars
    // svg.selectAll("rect")
    //     .data(dates)
    //     .enter()
    //     .append("rect")
    //     .attr("fill", "royalblue")
    //     .attr("opacity", (d) => {
    //         if (key == d) {
    //             return 1
    //         }else{
    //             return 0.5
    //         }
    //     })
    //     .attr('width', (d) => {
    //         return xAxis.bandwidth()
    //     })
    //     .attr('height', (d) => {
    //         return height - yAxis(totalCrimeByMonth[d][ALL_RACES]) - 50
    //     })
    //     .attr('x', (d) => {
    //         return xAxis(d)
    //     })
    //     .attr('y', (d) => {
    //         return yAxis(totalCrimeByMonth[d][ALL_RACES])
    //     })

    // stacked barchart work
    //
    // subgroups = categories
    // subgroupColor = categoryColor
    // groups = dates
    const categories = getCategories(crimeCategories)
    const colors = getCategoryColors(crimeCategories)

    const color = scaleOrdinal()
        .domain(categories)
        .range(colors)

    const data = processedDataForStackedBarChart(totalCrimeByMonth, overviewData, categories)

    data.sort((rec1, rec2) => {
        const s1 = rec1[ARREST_DATE]
        const s2 = rec2[ARREST_DATE]

        const s1Date = s1.split("-")
        const s1Year = s1Date[0]
        let s1Month = s1Date[1]
        if (s1Month.length == 1) {
            s1Month = "0"+s1Month
        }
        const s2Date = s2.split("-")
        const s2Year = s2Date[0]
        let s2Month = s2Date[1]
        if (s2Month.length == 1) {
            s2Month = "0"+s2Month
        }
        const val1 = parseInt(s1Year + s1Month)
        const val2 = parseInt(s2Year + s2Month)
        return val1 - val2

    })

    const stackedData = stack()
        .keys(categories)(data)

    // There should be a better way to do this.
    let mouseOverAssaultDate;
    const barLocations = {}

    svg.append("g")
        .selectAll("g")
        .data(stackedData)
        .join("g")
        .attr("fill", d => {
            const c = color(d.key)
            return c
        })
        .on("mouseover", (e, d) => {
            const crimeType = d.key
            tooltip.showToolTip(tooltip.formatToolTip(
                crimeType,
                overviewData[mouseOverAssaultDate][crimeType],
                totalCrimeByMonth[mouseOverAssaultDate],
                mouseOverAssaultDate
                ),
                e.pageX, e.pageY)
            select(e.target).transition().attr("filter", "url(#dropshadow)")
        })
        .on("mousemove", (e, d) => {
            tooltip.moveToolTip(e.pageX, e.pageY)
        })
        .on("mouseout", (e, d) => {
            tooltip.hideToolTip()
            select(e.target).transition().attr("filter", "")
        })
        .selectAll("rect")
            .data(d => {
                return d
            })
            .join("rect")
                .attr("opacity", d => {
                    const arrestDate = d.data[ARREST_DATE]
                    if (arrestDate == key) {
                        return 1
                    }
                    return 0.1
                })
                .attr("x", d => {
                    const xVal = xAxis(d.data[ARREST_DATE])
                    if (!(d.data[ARREST_DATE] in barLocations)) {
                        barLocations[d.data[ARREST_DATE]] = {
                            x: 0,
                            y: 0
                        }
                    }
                    barLocations[d.data[ARREST_DATE]]['x'] = xVal
                    return xVal
                })
                .attr("y", d => {
                    const yVal = yAxis(d[1])
                    if (!(d.data[ARREST_DATE] in barLocations)) {
                        barLocations[d.data[ARREST_DATE]] = {
                            x: 0,
                            y: 0
                        }
                    }
                    barLocations[d.data[ARREST_DATE]]['y'] = yVal
                    return yVal
                })
                .attr("height", d => yAxis(d[0]) - yAxis(d[1]))
                .attr("width", d => xAxis.bandwidth())
            .on("mouseover", (e, d) => {
                mouseOverAssaultDate = d.data[ARREST_DATE]
            })

            createLegend(svg, categories, colors, width, margin)
            createPrepandemicAnnotations(svg, barLocations)
}
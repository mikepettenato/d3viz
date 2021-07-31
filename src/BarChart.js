import {stack} from 'd3'
import {axisLeft, axisBottom} from 'd3-axis'
import {easeLinear} from 'd3-ease'
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
    '2019-5' : [
        'Crime peaks in New York City with',
        '10,250 crimes committed in the month.',
        'COVID-19 is an unknown pathogen in the world'
    ],
    '2019-11' : [
        //, on November 11, 2019
        'The first reported case of COVID-19 occurs',
        'in Hubei Provenance, China.  New Yorkers are',
        'largely unaware of the virus and there have been',
        "8,395 crimes committed in New York City this month."
    ],
    '2019-12' : [
        //  on December 31, 2019
        '44 cases of COVID-19 are reported in Wuhan, China',
        'and none in New York. 7,308 criminal incidents',
        'occurred this month, which is consistent with',
        'the previous monthly averages for December.'
    ],
    '2020-1' : [
        //on January 11, 2019
        "China reports its first COVID-19 death and the first",
        // on January 21, 2020
        "confirmed COVID-19 case occurs in the U.S.",
        "8,931 crimes have occurred this month."
        ],
    '2020-2' : [
        // On January 30, 2020
        "W.H.O. designates COVID-19 a Public-Health Emergency and the",
        //2/29/2020:
        "first reported COVID-19 death occurs in the U.S. There are ",
        "8,367 crimes this month."
    ],
    '2020-3' : [
        // 03/07/2020:
        "The first COVID-19 case occurs in New York, and New York City",
        "declares a State of Emergency due to COVID-19.",
        // 03/1/2020:
        // 03/16/2021:
        "NYC public schools close due to fear of the virus.",
        "New Yorkers that can telecommute to work, start to do so."
        ],
    '2020-4' : [
        // 4/10/2020:
        "NY State records more COVID-19 cases than any other country",
        "other than the U.S.  New York City is in its first full month of",
        "lock down. 5,006 crimes committed this month, which constitutes",
        "a 49% decrease in crime compared to the same time last year.",
    ],
    '2020-5' : [
        // 5/15/2020:
        "New York tries to lift some restrictions. Drive-in theaters,landscaping",
        "landscaping and low-risk recreational activities are reopened. The     ",
        "COVID rates, however, are increasing at an alarming rate               ",
        "and New York is running out of hospital ventilators.                   "
    ],
    '2020-6' : [
        // '06/24/2020:
        'New York is fully locked down.  Quarantine restrictions are now in affect',
        'for travelers arriving in NY. The crime rate in NYC has dropped by',
        '44% compared to last year. 5,069 crimes have occurred this month.  '
        // '06/08/2020: NYC begins phase 1 reopening',
        // '06/22/2020: NYC begins phase 2 reopening'
        ],
    '2020-7' : [
        // 7/24/2020:
        'NYC reports 227,517 COVID-19 cases and 22,934 deaths to date',
        "The NYC crime rate drops 52% compared to last year.  There are ",
        "4,894 criminal incidents reported this month."
    ],
    '2020-8' : [
        // 10/01/2020:
        'NYC middle and high schools begin in-person learning',
        //10/05/2020:
        'NYC reports 252,000 COVID-19 cases and 23,861 deaths to date'
    ],
    '2020-9' : [
        // 09/08/2020:
        'Sheriff deputies enforce signed quarantine forms from',
        // 09/09/2020:
        'Port Authority buses Malls in NYC reopen at 50% capacity',
        // 09/16/2020:
        'Mayor de Blasio furloughs his City Hall staff, including himself'
    ],
    '2020-11' :[
        // 11/19/2020:
        'New York City schools switch to all-remote.',
        // 11/21/2020:
        'Restrictions on indoor dining are renewed in New York City.'
    ],
    '2021-2': [
        // 02/11/2021:
        'Restaurants reopen indoor dining at 25% capacity. New Yorkers',
        // 02/14/2021:
        'with underlying conditions are eligible for COVID-19 vaccine.'
    ],
    '2021-3': [
        // 02/11/2021:
        'New York City has an 11.4% unemployment rate, due to the COVID-19 pandemic.',
        "Restaurants start to reopen and create 15,0000 new jobs. New York City\'s ",
        // 02/14/2021:
        'crime rate has increased by 5% when compared to March, 2020.'
    ]
}

const clearAnnotations = (svg) => {
    svg.selectAll("g.annotations").remove()
}

const drawAnnotations = (svg, date, x, y) => {
    clearAnnotations(svg)

    const height = parseInt(svg.attr("height"))
    const width = parseInt(svg.attr("width"))


    let numberOfAnnotations = 0
    if (date in chart_annotations) {
        numberOfAnnotations = chart_annotations[date].length
    }
    if ((date in chart_annotations)) {
        const annotations = svg.append("g")
        let x_translate = x + 50
        let textAnchor = "start"
        if (x > width/2) {
            x_translate = x - 10
            textAnchor = "end"
        }
        annotations
            .attr("class", "annotations")
            //.attr("transform", `translate(${(width)/2}, ${margin.top/1.7})`)
            .attr("transform", `translate(${x_translate}, ${height/2})`)
        annotations.selectAll("text")
            .data(chart_annotations[date])
            .enter()
            .append("text")
            .attr("y", (d, i) => i*20)
            //.attr("text-anchor", "start")
            .attr("text-anchor", textAnchor)
            .attr("font-weight", 700)
            //.style('font-size', 16)
            .style('font-size', 12)
            .style("fill", "darkorange")
            .text((d, i) => chart_annotations[date][i].replace(' ', '\u00A0'))

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
                return 0.05
            }
        })

    drawAnnotations(svg, key, parseInt(x), parseInt(y))

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
        .attr("cy", (d, i) => i*13)
        .attr("r", 4)
        .style("fill", (d) => categoryMap[d])
    legend.selectAll("text")
        .data(categories)
        .enter()
        .append("text")
        .attr("x", 9)
        .attr("y", (d, i) => i*13+3)
        .text((d) => d)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("fill", (d) => categoryMap[d])
        .style("font-size", 9)

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
        .attr("cx", margin.left+105)
        .attr("cy", margin.top/1.4)
        .attr("r", 5)
        .style("fill", 'limegreen')
    prepandemicAnnotations
        .append("text")
        .attr("x", margin.left+120)
        .attr("y", margin.top/1.4 + 2)
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

    svg
        .append("text")
        .attr("x" , (width - margin.left - 10))
        .attr("y", (height - margin.bottom + 35))
        .style("font-size", 11)
        .text("Months →")


    // svg.append("text")
    //     .attr("x", margin.left)
    //     .attr("y", margin.top)
    //     .text("Hello Again")

    const yDomain = findYDomain(totalCrimeByMonth)

    const yAxis = scaleLinear()
        .domain(yDomain)
        .range([(height - margin.bottom), margin.top])

    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(axisLeft().scale(yAxis))
        .call(g => g.append("text")
            .attr("x", margin.left/1.5)
            .attr("y", margin.top - 5)
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .text("↑ Crime Incidents")
        )


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
                    return 0.05
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


    const start_message = [
        '↑',
        'Start Here',
    ]
    const clearStartMessage = () => {
        svg.selectAll('g.start').remove()
    }
    const startMessage = () => {
        const g = svg.append("g")
        g.attr("class", "start")
        g.selectAll("text")
            .data(start_message)
            .enter()
            .append("text")
            .attr("x", margin.left*5.65)
            .attr("y", (d, i) => 25 + i*15)
            .attr("text-anchor", "middle")
            .style('font-size', '.75em')
            .style('fill', 'gray')
            .text((d) => d)
        let num_times = 0
        const repeatAnimation = () => {
            g.selectAll("text")
                .transition()
                .ease(easeLinear)
                .style('font-size', '1em')
                .duration(500)
                .delay(1000)
                .transition()
                .ease(easeLinear)
                .style('font-size', '.75em')
                .duration(500)
                .on('end', (d) => {
                    if (num_times < 3) {
                        num_times++
                        repeatAnimation()
                    }
                })
        }
        repeatAnimation()
    }

    const free_explore_message = [
        '↑',
        'Controls and additional info are Enabled.',
        'Please feel free to Explore!'
    ]
    const clearFreeExploreMessage = () => {
        svg.selectAll('g.free_explore').remove()
    }
    const freeExploreMessage = () => {
        const g = svg.append("g")
        g.attr("class", "free_explore")
        g.selectAll("text")
            .data(free_explore_message)
            .enter()
            .append("text")
            .attr("x", margin.left*2.5)
            .attr("y", (d, i) => 25 + i*15)
            .attr("text-anchor", "middle")
            .style('font-size', '.75em')
            .style('fill', 'gray')
            .text((d) => d)
        let num_times = 0
        const repeatAnimation = () => {
            g.selectAll("text")
                .transition()
                .ease(easeLinear)
                .style('font-size', '1em')
                .duration(500)
                .delay(1000)
                .transition()
                .ease(easeLinear)
                .style('font-size', '.75em')
                .duration(500)
                .on('end', (d) => {
                    if (num_times < 3) {
                        num_times++
                        repeatAnimation()
                    }
                })
        }
        repeatAnimation()
    }

    const createTitle = () => {
        const title = svg.append('g')
            .attr('id', 'title')

        title
            .append('text')
            // .transition()
            // .duration(3000)
            .attr('x', width/2)
            .attr('y', margin.top/4)
            .attr("text-anchor", "middle")
            .attr('font-family', 'Georgia, serif')
            .text(`NYC Monthly Crime Rate`)
    }

    // Draws The first Annotation
    drawAnnotations(svg, key, parseInt(barLocations[key].x), parseInt(barLocations[key].y))
    createLegend(svg, categories, colors, width, margin)
    createTitle()
    createPrepandemicAnnotations(svg, barLocations)
}
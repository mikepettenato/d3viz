import {axisBottom} from 'd3-axis'
import {easeLinear} from 'd3-ease'
import {select, selectAll} from 'd3-selection'
import transition from 'd3-transition'
import {scaleLinear, scaleQuantize, scaleQuantile, scaleSqrt} from 'd3-scale'
import {forceSimulation, forceCollide, forceX, forceY} from 'd3-force'
import {ALL_RACES, ASIAN_PACIFIC_ISLANDER, BLACK, HISPANIC, OFFENSE, WHITE} from './NycCrimeDataLoader'
import {findKey, ToolTip, formatToolTip} from './Utils'

const findRange = (map, type) => {
    let max = 0;
    let min;
    Object.keys(map).forEach((year) => {
        const yearMap = map[year]
        Object.keys(yearMap).forEach((category) => {
            const data = yearMap[category]
            if (!min || data[type] < min) {
                min = data[type]
            }
            if (data[type] > max) {
                max = data[type]
            }
        })
    })
    return [min, max]
}

const clearAnnotations = (svg) => {
    svg.selectAll("g.annotation").remove()
}

const chart_annotations = {
    '2019-1': {
        crimeType:  'ASSAULT',
        text: 'Assault makes up the largest percentage of crime in NYC'
    },
    '2019-6': {
        crimeType:  'ASSAULT',
        text: 'Assault records the largest percentage in crime for a pre-pandemic month'
    },
    '2019-7': {
        crimeType:  'ASSAULT',
        text: 'Assault records its largest number of monthly incidents in NYC'
    },
    '2019-12': {
        crimeType:  'MURDER',
        text: 'Murder records its smallest number of monthly incidents in NYC'
    },
    '2020-3': {
        crimeType:  'MURDER',
        text: 'NYC locks down.  While other crime rates fall, murder has a slight up-tick'
    },
    '2020-4': {
        crimeType:  'MURDER',
        text: 'While most of the other crime incidents see a large decrease, murder does not'
    },
    '2020-5': {
        crimeType:  'FELONY DRUGS',
        text: 'Overall crime in NYC sees an uptick, Led by a Felony Drugs increase of 63% compared to the previous month'
    },
    '2020-6': {
        crimeType:  'FELONY DRUGS',
        text: 'Felony Drug crimes sees its lowest crime percentage'
    },
    '2020-7': {
        crimeType:  'ASSAULT',
        text: 'Assault makes up the largest percentage of crime, however, totals are down ~40% from pre-pandemic numbers'
    },
    '2020-8': {
        crimeType: 'KIDNAPPING',
        text: 'Kidnapping makes up the lowest type of crime in New York City'
    },
    '2020-9': {
        crimeType:  'WEAPON POSSESSION',
        text: 'Weapon Possession increases 47% from the previous month'
    },
    '2020-10': {
        crimeType:  'GRAND LARCENY',
        text: 'Grand Larceny increases 22% from the previous month'
    },
    '2020-12': {
        crimeType:  'MURDER',
        text: 'Murder records its highest number of monthly incidents and highest monthly percentage'
    },
    '2021-3': {
        crimeType: 'MURDER',
        text: "While most other crime rates are down, murder rates are above pre-pandemic rates"
    }
}

const crimeTypeMap = (crimeCategories) => {
    const crimeMap = {}
    crimeCategories.forEach(category => {
        crimeMap[category.name] = category.color
    })
    return crimeMap
}

const drawAnnotations = (svg, date, height, width, crimeMap) => {

    clearAnnotations(svg)

    if (date in chart_annotations) {
        const crimeType = chart_annotations[date].crimeType
        const text = chart_annotations[date].text
        const cx = parseInt(svg.select(`circle#${crimeType.replace(" ", "_")}`).attr("cx"))
        const cy = parseInt(svg.select(`circle#${crimeType.replace(" ", "_")}`).attr("cy"))

        const textAnnotation = svg.append("g")
        textAnnotation.attr("class", "annotation")
        textAnnotation
            .append("text")
            .attr("class", "annotation")
            .attr("x", width / 2)
            .attr("y", 20)
            .style("fill", crimeMap[crimeType])
            .style('font-size', '.25em')
            .attr("text-anchor", "middle")
            .text(text)
        textAnnotation.selectAll("text")
            .transition()
            .ease(easeLinear)
            .style('font-size', '1em')
            .duration(500)
            .transition()
            .ease(easeLinear)
            .style('font-size', '.85em')
            .duration(500)

        // const lineAnnotation = svg.append("g")
        // lineAnnotation.attr("class", "annotation")
        // lineAnnotation
        //     .append("line")
        //     .attr("x1", cx)
        //     .attr("y1", cy)
        //     .attr("x2", width / 2)
        //     .attr("y2", 20)
        //     .style("stroke", "slategray")
        //     .style("stoke-width", 0.5)
    }


}

export async function BubbleCloud(svg_element, tooltip, categories, data, crimeByMonth, partition, elemYearId, elemMonthId, eventCallback) {

    const width = select(svg_element).attr("width")
    const height = select(svg_element).attr("height")
    const crimeMap = crimeTypeMap(categories)
    let enable_annotations = false

    const scaledCircle = scaleSqrt()
        .domain(findRange(data, partition))
        .range([30, 130])

    const svg = select(svg_element)
        .append("g")
        .attr("transform", "translate(0, 0)")
    const circles = svg.selectAll("circle")
        .data(categories)
        .enter()
        .append("circle")
        .attr("id", (category) => category.name.replace(" ", "_"))
        .attr("r", (category, i) => {
            const key = findKey(elemYearId, elemMonthId)
            const allRaces = data[key][category.name][partition]
            return scaledCircle(allRaces)
        })
        .attr("fill", (category, i) => {
            return category.color
        })
        .on("mouseover", (e, d) => {
            const monthDate = findKey(elemYearId, elemMonthId)
            tooltip.showToolTip(tooltip.formatToolTip(
                d.name,
                data[monthDate][d.name],
                crimeByMonth[monthDate],
                monthDate,
                ),
                e.pageX, e.pageY)

            // Make circle appear to raise when hovered over
            select(e.target).transition().attr("filter", "url(#dropshadow)")
        })
        .on("mousemove", (e, d) => {
            // tooltip
            //     .style("left", (e.pageX + 20) + "px")
            //     .style("top", e.pageY + "px")
            tooltip.moveToolTip(e.pageX, e.pageY)
        })
        .on("mouseleave", (e, d)=> {
            tooltip.hideToolTip()
            // tooltip
            //     .style("opacity", 0)

            // Remove raised look look from circle
            select(e.target).transition().attr("filter", "")
        })
    const text = svg.selectAll("text")
        .data(categories)
        .enter()
        .append("text")
        .attr("font-weight", 700)
        .attr("class", ".annotation")
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .attr("style", "font-size: 9")

    text
        .append("tspan")
            .text((category) => {
                return category.name
            })
    const percentTspan = text.append("tspan")

    percentTspan
        .text((category) => {
            const key = findKey(elemYearId, elemMonthId)
            const total = crimeByMonth[key][ALL_RACES]
            const categoryTotal = data[key][category.name][ALL_RACES]
            return " " + (100*categoryTotal/total).toFixed(2) + "%"
        })

    const simulation = forceSimulation()
    simulation.force("xForce", forceX(width/2).strength(0.05))
    simulation.force("yForce", forceY(height/2).strength(0.05))
    simulation.force("no_collision", forceCollide((category) => {
        const key = findKey(elemYearId, elemMonthId)
        return scaledCircle(data[key][category.name][partition]) + 3
    }))
    simulation.nodes(categories)
        .on("tick", () => {
            circles
                .attr("cx", (d) => {
                    return d.x
                })
                .attr("cy", (d) => {
                    return d.y
                })
            text
                .attr("x", (d) => {
                    return d.x
                })
                .attr("y", (d) => {
                    return d.y
                })
        })
        .on("end", () => {
            // draw any of the annotations after the circles
            // have moved into place
            if (enable_annotations) {
                drawAnnotations(svg, findKey(elemYearId, elemMonthId), height, width, crimeMap)
            }
        })

    const martiniGlassSlideShow = [
        ['2019-11']
    ]

    const forward = () => {
        const key = findKey(elemYearId, elemMonthId)

        circles.transition()
            .duration(2000)
            .attr("r", (category, i) => {
                const allRaces = data[key][category.name][partition]
                return scaledCircle(allRaces)
            })

        percentTspan
            .transition()
            .text((category) => {
                // return d[ALL_RACES].toLocaleString()
                const key = findKey(elemYearId, elemMonthId)
                const total = crimeByMonth[key][ALL_RACES]
                const categoryTotal = data[key][category.name][ALL_RACES]
                return " " + (100*categoryTotal/total).toFixed(2) + "%"
            })

        simulation.force("xForce").initialize(categories)
        simulation.force("yForce").initialize(categories)
        simulation.force("no_collision").initialize(categories)
        simulation.restart()
        eventCallback()
    }

    const backwards = () => {
        const key = findKey(elemYearId, elemMonthId)

        circles.transition()
            .duration(2000)
            .attr("r", (category, i) => {
                const allRaces = data[key][category.name][partition]
                return scaledCircle(allRaces)
            })

        percentTspan
            .transition()
            .text((category) => {
                // return d[ALL_RACES].toLocaleString()
                const key = findKey(elemYearId, elemMonthId)
                const total = crimeByMonth[key][ALL_RACES]
                const categoryTotal = data[key][category.name][ALL_RACES]
                return " " + (100*categoryTotal/total).toFixed(2) + "%"
            })

        simulation.force("xForce").initialize(categories)
        simulation.force("yForce").initialize(categories)
        simulation.force("no_collision").initialize(categories)
        simulation.restart()
        eventCallback()

    }

    const enableAnnotations = () => {
        enable_annotations = true
    }

    const enable = () => {
        select("div#bubbleCloudDiv")
            .style("display", "block")
    }

    return {
        forward: forward,
        backwards: backwards,
        enableAnnotations: enableAnnotations,
        enable: enable
    }
}

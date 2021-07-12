import {axisBottom} from 'd3-axis'
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

const incrementDate = (yearStr, monthStr) => {
    let month = parseInt(monthStr)
    let year = parseInt(yearStr)
    month += 1
    if (month > 3 && year == 2021) {
        month = 1
        year = 2019
    }else if (month > 12) {
        month = 1
        year += 1
    }
    return {
        month: month,
        year: year
    }
}

// const findKey = (elemYearId, elemMonthId) => {
//     const year = select(elemYearId).text()
//     const month = select(elemMonthId).text()
//     return `${year}-${month}`
// }

export async function BubbleCloud(svg_element, tooltip, categories, data, crimeByMonth, partition, elemYearId, elemMonthId, eventCallback) {

    // const formatToolTip = (name) => {
    //     const key = findKey(elemYearId, elemMonthId)
    //     const all = data[key][name][ALL_RACES]
    //     const asian = data[key][name][ASIAN_PACIFIC_ISLANDER]
    //     const black = data[key][name][BLACK]
    //     const hispanic = data[key][name][HISPANIC]
    //     const white = data[key][name][WHITE]
    //     return `<div class="tooltipContainer">
    //                 <div class="tooltipHeader">${name}</div>
    //                 <div class="tooltipBody">
    //                     <div>Demographic Breakdown</div>
    //                     <div class="tooltipRow">
    //                         <div class="tooltipCol">
    //                             <div class="tooltipColHeader">All (total)</div>
    //                             <div class="tooltipCell">${all}</div>
    //                         </div>
    //                         <div class="tooltipCol">
    //                             <div class="tooltipColHeader">Asian</div>
    //                             <div class="tooltipCell">${asian}</div>
    //                         </div>
    //                         <div class="tooltipCol">
    //                             <div class="tooltipColHeader">Black</div>
    //                             <div class="tooltipCell">${black}</div>
    //                         </div>
    //                         <div class="tooltipCol">
    //                             <div class="tooltipColHeader">Hispanic</div>
    //                             <div class="tooltipCell">${hispanic}</div>
    //                         </div>
    //                         <div class="tooltipCol">
    //                             <div class="tooltipColHeader">White</div>
    //                             <div class="tooltipCell">${white}</div>
    //                         </div>
    //                     </div>
    //                     <div class="tooltipRow">
    //
    //                     </div>
    //                 </div>
    //             </div>
    //
    //             `
    // }

    // select the tooltip
    //const tooltip = select(tooltipElement)

    const width = select(svg_element).attr("width")
    const height = select(svg_element).attr("height")
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
        .attr("r", (category, i) => {
            const key = findKey(elemYearId, elemMonthId)
            const allRaces = data[key][category.name][partition]
            return scaledCircle(allRaces)
        })
        .attr("fill", (category, i) => {
            return category.color
        })
        .on("mouseover", (e, d) => {
            tooltip.showToolTip(tooltip.formatToolTip(d.name, data[findKey(elemYearId, elemMonthId)][d.name]), e.pageX, e.pageY)
            // tooltip.html(formatToolTip(d.name, data[findKey(elemYearId, elemMonthId)][d.name]))
            //     .style("opacity", 0.9)
            //     .style("left", (e.pageX + 20) + "px")
            //     .style("top", e.pageY + "px")

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
                //console.log(category.name + " : " + category.color)
                return category.name
            })
    const percentTspan = text.append("tspan")

    percentTspan
        .text((category) => {
            // return d[ALL_RACES].toLocaleString()
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
        return scaledCircle(data[key][category.name][partition]) + 2
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

    select("#next").on("click", (e) => {
        const year = select("span#year").text()
        const month = select("span#month").text()
        const newDate = incrementDate(year, month)
        select("span#year").text((d) => {
            return newDate.year
        })
        select("span#month").text((d) => {
            return newDate.month
        })

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

    })

}

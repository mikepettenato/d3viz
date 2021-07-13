import {select, selectAll} from 'd3-selection'
import {ALL_RACES, ASIAN_PACIFIC_ISLANDER, BLACK, HISPANIC, OFFENSE, WHITE} from './NycCrimeDataLoader'

export const findKey = (elemYearId, elemMonthId) => {
    const year = select(elemYearId).text()
    const month = select(elemMonthId).text()
    return `${year}-${month}`
}

const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
]
export const ToolTip = (tooltipElement) => {

    return {
        moveToolTip: (pageX, pageY) => {
            // select the tooltip
            const tooltip = select(tooltipElement)

            const width = tooltip.node().getBoundingClientRect().width
            const height = tooltip.node().getBoundingClientRect().height
            const windowWidth = window.innerWidth
            const windowHeight = window.innerHeight

            let left = (pageX + 20) + "px"
            let top = pageY + "px"

            if ((pageX + 20 + width) >= windowWidth) {
                left = (pageX - 20 - width) + "px"
            }
            if ((pageY + height) >= windowHeight) {
                top = (pageY - height) + "px"
            }

            tooltip
                .style("left", left)
                .style("top", top)

        },
        showToolTip: (tooltipHtml, pageX, pageY) => {
            // select the tooltip
            const tooltip = select(tooltipElement)

            let left = (pageX + 20) + "px"
            let top = pageY + "px"
            tooltip.html(tooltipHtml)
                .style("opacity", 0.9)
                .style("left", left)
                .style("top", top)

        },
        formatToolTip: (title, data, crimeByMonth, monthDate) => {
            const year = monthDate.split('-')[0]
            const monthIndex = monthDate.split('-')[1]
            const month = months[monthIndex-1]

            const all = data[ALL_RACES]
            const asian = data[ASIAN_PACIFIC_ISLANDER]
            const black = data[BLACK]
            const hispanic = data[HISPANIC]
            const white = data[WHITE]
            const totalCrime = crimeByMonth[ALL_RACES]
            const crimePercent = (100*all/totalCrime).toFixed(2)
            return `<div class="tooltipContainer">
                            <div class="tooltipHeader">${title}</div>
                            <div class="tooltipBody">
                                <ul class="tooltipPara">
                                    <li class="tooltipListItems">NYC had <b>${totalCrime}</b> total criminal incidents in ${month}, ${year}.</li>  
                                    <li class="tooltipListItems">${title} made up <b>${crimePercent}%</b> in NYC din ${month}, ${year}.</li>  
                                </ul>

                                <div>Demographic Breakdown of Offenders</div>
                                <div class="tooltipRow">
                                    <div class="tooltipCol">
                                        <div class="tooltipColHeader">All (total)</div>
                                        <div class="tooltipCell">${all}</div>
                                    </div>
                                    <div class="tooltipCol">
                                        <div class="tooltipColHeader">Asian</div>
                                        <div class="tooltipCell">${asian}</div>
                                    </div>
                                    <div class="tooltipCol">
                                        <div class="tooltipColHeader">Black</div>
                                        <div class="tooltipCell">${black}</div>
                                    </div>
                                    <div class="tooltipCol">
                                        <div class="tooltipColHeader">Hispanic</div>
                                        <div class="tooltipCell">${hispanic}</div>
                                    </div>
                                    <div class="tooltipCol">
                                        <div class="tooltipColHeader">White</div>
                                        <div class="tooltipCell">${white}</div>
                                    </div>
                                </div>
                                <div class="tooltipRow">
                                    
                                </div>
                            </div>
                        </div>
        
            `
        },
        hideToolTip: () => {
            const tooltip = select(tooltipElement)
            tooltip
                .style("opacity", 0)
        }

    }
}

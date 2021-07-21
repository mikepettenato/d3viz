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
    let tooltipsEnabled = false
    return {
        enable: () => {
            tooltipsEnabled = true
        },
        moveToolTip: (pageX, pageY) => {
            if (!tooltipsEnabled) {
                return
            }
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
            if (!tooltipsEnabled) {
                return
            }
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
            if (!tooltipsEnabled) {
                return
            }
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
                                    <li class="tooltipListItems">${title} made up <b>${crimePercent}%</b> in NYC in ${month}, ${year}.</li>  
                                </ul>

                                <div>Demographic Breakdown of Offenders</div>
                                <div class="tooltipRow">
                                    <div class="tooltipCol">
                                        <div class="tooltipColHeader tooltipAll">All (total)</div>
                                        <div class="tooltipCell tooltipAll">${all}</div>
                                    </div>
                                    <div class="tooltipCol">
                                        <div class="tooltipColHeader tooltipAsian">Asian</div>
                                        <div class="tooltipCell tooltipAsian">${asian}</div>
                                    </div>
                                    <div class="tooltipCol">
                                        <div class="tooltipColHeader tooltipBlack">Black</div>
                                        <div class="tooltipCell tooltipBlack">${black}</div>
                                    </div>
                                    <div class="tooltipCol">
                                        <div class="tooltipColHeader tooltipHispanic">Hispanic</div>
                                        <div class="tooltipCell tooltipHispanic">${hispanic}</div>
                                    </div>
                                    <div class="tooltipCol">
                                        <div class="tooltipColHeader tooltipWhite">White</div>
                                        <div class="tooltipCell tooltipWhite">${white}</div>
                                    </div>
                                </div>
                                <div class="tooltipRow">
                                    
                                </div>
                            </div>
                        </div>
        
            `
        },
        formatLineChartToolTip: (title, data, the_date) => {
            if (!tooltipsEnabled) {
                return
            }

            const all = data[ALL_RACES]
            const asian = data[ASIAN_PACIFIC_ISLANDER]
            const black = data[BLACK]
            const hispanic = data[HISPANIC]
            const white = data[WHITE]
            return `<div class="tooltipContainer">
                            <div class="tooltipHeader">${title}</div>
                            <div class="tooltipBody">
                                <ul class="tooltipPara">
                                    <li class="tooltipListItems">NYC had <b>${all}</b> total criminal incidents on ${the_date}.</li>  
                                </ul>

                                <div>Demographic Breakdown of Offenders</div>
                                <div class="tooltipRow">
                                    <div class="tooltipCol">
                                        <div class="tooltipColHeader tooltipAll">All (total)</div>
                                        <div class="tooltipCell tooltipAll">${all}</div>
                                    </div>
                                    <div class="tooltipCol">
                                        <div class="tooltipColHeader tooltipAsian">Asian</div>
                                        <div class="tooltipCell tooltipAsian">${asian}</div>
                                    </div>
                                    <div class="tooltipCol">
                                        <div class="tooltipColHeader tooltipBlack">Black</div>
                                        <div class="tooltipCell tooltipBlack">${black}</div>
                                    </div>
                                    <div class="tooltipCol">
                                        <div class="tooltipColHeader tooltipHispanic">Hispanic</div>
                                        <div class="tooltipCell tooltipHispanic">${hispanic}</div>
                                    </div>
                                    <div class="tooltipCol">
                                        <div class="tooltipColHeader tooltipWhite">White</div>
                                        <div class="tooltipCell tooltipWhite">${white}</div>
                                    </div>
                                </div>
                                <div class="tooltipRow">
                                    
                                </div>
                            </div>
                        </div>
        
            `
        },
        hideToolTip: () => {
            if (!tooltipsEnabled) {
                return
            }
            const tooltip = select(tooltipElement)
            tooltip
                .style("opacity", 0)
        }

    }
}

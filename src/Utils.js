import {select, selectAll} from 'd3-selection'
import {ALL_RACES, ASIAN_PACIFIC_ISLANDER, BLACK, HISPANIC, OFFENSE, WHITE} from './NycCrimeDataLoader'

export const findKey = (elemYearId, elemMonthId) => {
    const year = select(elemYearId).text()
    const month = select(elemMonthId).text()
    return `${year}-${month}`
}

export const ToolTip = (tooltipElement) => {

    return {
        showToolTip: (tooltipHtml, pageX, pageY) => {
            // select the tooltip
            const tooltip = select(tooltipElement)
            tooltip.html(tooltipHtml)
                .style("opacity", 0.9)
                .style("left", (pageX + 20) + "px")
                .style("top", pageY + "px")

        },
        formatToolTip: (title, data) => {
            const all = data[ALL_RACES]
            const asian = data[ASIAN_PACIFIC_ISLANDER]
            const black = data[BLACK]
            const hispanic = data[HISPANIC]
            const white = data[WHITE]
            return `<div class="tooltipContainer">
                            <div class="tooltipHeader">${title}</div>
                            <div class="tooltipBody">
                                <div>Demographic Breakdown of Offender</div>
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
        moveToolTip: (pageX, pageY) => {
            // select the tooltip
            const tooltip = select(tooltipElement)
            tooltip
                .style("left", (pageX + 20) + "px")
                .style("top", pageY + "px")

        },

        hideToolTip: () => {
            const tooltip = select(tooltipElement)
            tooltip
                .style("opacity", 0)
        }

    }
}

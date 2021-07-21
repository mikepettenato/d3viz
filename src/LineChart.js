import {extent, max} from 'd3-array'
import {axisLeft, axisBottom} from 'd3-axis'
import {pointer, select, selectAll} from 'd3-selection'
import {scaleBand, scaleLinear, scaleTime} from 'd3-scale'
import {line} from 'd3-shape'

import {findKey} from './Utils'

const margin = {
    top: 35,
    bottom: 20,
    left: 30,
    right: 20,
}

export const LineChart = async (svg_element, weekly_data, tooltip, span_year, span_month) => {
    const svg = select(svg_element)
    const width = svg.attr('width')
    const height = svg.attr('height')

    const x = scaleTime().range([0, (width-(margin.left + margin.right))])
    const xAxis = axisBottom().scale(x)


    const y = scaleLinear().range([height - (margin.top + margin.bottom), 0])
    const yAxis = axisLeft().scale(y)
        //.domain([0, maxVal])

    // group for x-axis
    svg.append('g')
        .attr('transform', `translate(${margin.left}, ${height - margin.bottom})`)
        .attr('class', 'lineXaxis')

    // group for y-axis
    svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .attr('class', 'lineYaxis')

    const drawLegend = () => {
        console.log("draw legend")
        const legend = svg.append('g')
            .attr('transform', `translate(${width/1.2}, ${margin.top/2})`)

        legend.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 4)
            //.attr('stroke', '#00A0A0')
            .attr('fill', '#00A0F0')
        legend.append('text')
            .attr('x', 5)
            .attr('y', 2)
            .attr('fill', '#00A0F0')
            .style('font-size', 9)
            .style('font-weight', 700)
            .text("ALL")

        legend.append('circle')
            .attr('cx', 40)
            .attr('cy', 0)
            .attr('r', 4)
            .attr('fill', '#00FF00')
        legend.append('text')
            .attr('x', 45)
            .attr('y', 2)
            .attr('fill', '#00FF00')
            .style('font-size', 9)
            .style('font-weight', 700)
            .text("ASIAN / PACIFIC ISLANDER")

        legend.append('circle')
            .attr('cx', 0)
            .attr('cy', 18)
            .attr('r', 4)
            .attr('fill', '#C0C000')
        legend.append('text')
            .attr('x', 5)
            .attr('y', 20)
            .attr('fill', '#C0C000')
            .style('font-size', 9)
            .style('font-weight', 700)
            .text("BLACK")

        legend.append('circle')
            .attr('cx', 50)
            .attr('cy', 18)
            .attr('r', 4)
            .attr('fill', '#A000FF')
        legend.append('text')
            .attr('x', 55)
            .attr('y', 20)
            .attr('fill', '#A000FF')
            .style('font-size', 9)
            .style('font-weight', 700)
            .text("HISPANIC")

        legend.append('circle')
            .attr('cx', 110)
            .attr('cy', 18)
            .attr('r', 4)
            .attr('fill', '#600000')
        legend.append('text')
            .attr('x', 115)
            .attr('y', 20)
            .attr('fill', '#600000')
            .style('font-size', 9)
            .style('font-weight', 700)
            .text("WHITE")
    }
    drawLegend()

    svg.selectAll('g#title').remove()

    const title = svg.append('g')
        .attr('id', 'title')

    title
        .append('text')
        .transition()
        .duration(3000)
        .attr('x', width/2)
        .attr('y', margin.top/2)
        .attr("text-anchor", "middle")
        .attr('font-family', 'Georgia, serif')
        .text(`NYC Daily Crime Rate`)



    const update = () => {

        svg.selectAll('path.allLine').remove()
        svg.selectAll('path.asianLine').remove()
        svg.selectAll('path.blackLine').remove()
        svg.selectAll('path.hispanicLine').remove()
        svg.selectAll('path.whiteLine').remove()

        const yearMonthKey = findKey(span_year, span_month)


        const dates = Object.keys(weekly_data[yearMonthKey])
        const data = []
        dates.forEach((item) => {
            data.push(new Date(item))
        })

        const maxVal = (max(data, (d, i) => {
            const key = dates[i]
            return weekly_data[yearMonthKey][key]['ALL']
       }))

        x.domain(extent(data, (d) => d))
        y.domain([0, maxVal])

        svg.selectAll('.lineXaxis')
            .transition()
            .duration(3000)
            .call(xAxis)

        svg.selectAll('.lineYaxis')
            .transition()
            .duration(3000)
            .call(yAxis)

        const g = svg.append('g')
        g
             .attr('transform', `translate(${margin.left}, ${margin.top})`)

        const all = g.selectAll('.allLine')
            .data([dates])

        all
            .data([dates])
            .enter()
            .append('path')
            .attr('class', 'allLine')
            //.merge(all)
            .transition()
            .duration(3000)
            .attr('d', line()
                .x(d => {
                    return x(new Date(d))
                })
                .y((d, i) => {
                    return y(weekly_data[yearMonthKey][d]['ALL'])
                })
            )
            .attr('fill', 'none')
            .attr('stroke', '#00A0F0')
            .on('end', () => {
                console.log('Done')
            })

        const asian = g.selectAll('.asianLine')
            .data([dates])

        asian
            .data([dates])
            .enter()
            .append('path')
            .attr('class', 'asianLine')
            //.merge(all)
            .transition()
            .duration(3000)
            .attr('d', line()
                .x(d => {
                    return x(new Date(d))
                })
                .y((d, i) => {
                    return y(weekly_data[yearMonthKey][d]['ASIAN / PACIFIC ISLANDER'])
                })
            )
            .attr('fill', 'none')
            .attr('stroke', '#00FF00')
            .on('end', () => {
                console.log('Done')
            })

        const black = g.selectAll('.blackLine')
            .data([dates])

        black
            .data([dates])
            .enter()
            .append('path')
            .attr('class', 'blackLine')
            //.merge(all)
            .transition()
            .duration(3000)
            .attr('d', line()
                .x(d => {
                    return x(new Date(d))
                })
                .y((d, i) => {
                    return y(weekly_data[yearMonthKey][d]['BLACK'])
                })
            )
            .attr('fill', 'none')
            .attr('stroke', '#C0C000')
            .on('end', () => {
                console.log('Done')
            })

        const hispanic = g.selectAll('.hispanicLine')
            .data([dates])

        hispanic
            .data([dates])
            .enter()
            .append('path')
            .attr('class', 'hispanicLine')
            //.merge(all)
            .transition()
            .duration(3000)
            .attr('d', line()
                .x(d => {
                    return x(new Date(d))
                })
                .y((d, i) => {
                    return y(weekly_data[yearMonthKey][d]['HISPANIC'])
                })
            )
            .attr('fill', 'none')
            .attr('stroke', '#A000FF')
            .on('end', () => {
                console.log('Done')
            })

        const white = g.selectAll('.whiteLine')
            .data([dates])

        white
            .data([dates])
            .enter()
            .append('path')
            .attr('class', 'whiteLine')
            //.merge(all)
            .transition()
            .duration(3000)
            .attr('d', line()
                .x(d => {
                    return x(new Date(d))
                })
                .y((d, i) => {
                    return y(weekly_data[yearMonthKey][d]['WHITE'])
                })
            )
            .attr('fill', 'none')
            .attr('stroke', '#600000')
            .on('end', () => {
                console.log('Done')
            })

        // add a rect to receive mouse events
        const rect_group = svg.append('g')

        rect_group
            .attr('transform', `translate(${margin.left}, ${margin.top})`)

        const rectangle = rect_group.append('rect')

        rectangle
            .attr('x', 0)
            .attr('y', 0)
            .attr('height', (height - (margin.top + margin.bottom)))
            .attr('width', (width - (margin.left + margin.right)))
            .style('opacity', 0)
            .on('mousemove', (e) => {
                const coordinates = pointer(e, this)
                const closest_date = x.invert(coordinates[0])
                closest_date.setHours(closest_date.getHours() + 12)
                const year = closest_date.getFullYear()
                const month =closest_date.getMonth() + 1
                const day = closest_date.getDate()
                const date_string = `${month}/${day}/${year}`
                const constructed_key = `${year}-${month}`
                const all_crime_incidents = weekly_data[constructed_key][date_string]['ALL']
                const asian_crime_incidents = weekly_data[constructed_key][date_string]['ASIAN / PACIFIC ISLANDER']
                const black_crime_incidents = weekly_data[constructed_key][date_string]['BLACK']
                const hispanic_crime_incidents = weekly_data[constructed_key][date_string]['HISPANIC']
                const white_crime_incidents = weekly_data[constructed_key][date_string]['WHITE']
                drawVerticalLine(new Date(date_string), all_crime_incidents)
                drawHorizontalLine(new Date(date_string), all_crime_incidents, 'all', '#00A0F0')
                drawHorizontalLine(new Date(date_string), asian_crime_incidents, 'asian', '#00FF00')
                drawHorizontalLine(new Date(date_string), black_crime_incidents, 'black', '#C0C000')
                drawHorizontalLine(new Date(date_string), hispanic_crime_incidents, 'hispanic', '#A000FF')
                drawHorizontalLine(new Date(date_string), white_crime_incidents, 'white', '#600000')
                const tooltip_html = tooltip.formatLineChartToolTip(
                    `DAILY CRIME DISTRIBUTION`,
                    {
                        'ALL': all_crime_incidents,
                        'ASIAN / PACIFIC ISLANDER': asian_crime_incidents,
                        'BLACK': black_crime_incidents,
                        'HISPANIC': hispanic_crime_incidents,
                        'WHITE': white_crime_incidents
                    },
                    date_string
                )
                tooltip.showToolTip(tooltip_html, e.pageX, e.pageY)
                tooltip.moveToolTip(e.pageX, e.pageY)
            })
            .on('mouseout', (e) => {
                tooltip.hideToolTip()
                select('g#tooltipLine').remove()
                select('g#tooltipLine_all').remove()
                select('g#tooltipLine_asian').remove()
                select('g#tooltipLine_black').remove()
                select('g#tooltipLine_hispanic').remove()
                select('g#tooltipLine_white').remove()
            })

        function drawVerticalLine(x1, y1) {
            select('g#tooltipLine').remove()
            const tooltipLine = svg.append('g')
                .attr('id', 'tooltipLine')
            console.log("Drawing line: " + y(y1))
            tooltipLine
                .append('line')
                .attr('x1', x(x1) + margin.left)
                .attr('y1', (height - margin.bottom))
                .attr('x2', x(x1) + margin.left)
                .attr('y2', margin.top)
                .attr('stroke', 'black')
                .attr('stroke-width', 0.5)
        }

        function drawHorizontalLine(x1, y1, id, color) {
            select(`g#tooltipLine_${id}`).remove()

            const tooltipLine = svg.append('g')
                .attr('id', `tooltipLine_${id}`)

            tooltipLine
                .append('line')
                .attr('x1', x(x1) + margin.left)
                .attr('y1', y(y1) + (margin.top))
                .attr('x2', margin.left)
                .attr('y2', y(y1) + (margin.top))
                .attr('stroke', color)
                .attr('stroke-width', 0.5)
        }
    }
    update()

    const enable = () => {
        select("div#lineChartDiv")
            // .style("display", "block")
            .transition()
            .duration(5000)
            .style('opacity', 1)

    }

    return {
        update: update,
        enable: enable
    }

    // const g = svg.append('g')
    //     .attr('transform', `translate(${margin.left}, ${margin.top})`)
    // g
    //     .append('path')
    //     .datum(dates)
    //     .attr('fill', 'none')
    //     .attr('stroke', 'steelblue')
    //     .attr('d', line()
    //         .x(d => x(new Date(d)))
    //         .y(d => y(weekly_data['2019-1'][d]['ALL']))
    //     )
    // g
    //     .append('path')
    //     .datum(dates)
    //     .attr('fill', 'none')
    //     .attr('stroke', 'black')
    //     .attr('d', line()
    //         .x(d => x(new Date(d)))
    //         .y(d => y(weekly_data[yearMonthKey][d]['BLACK']))
    //     )
    // g
    //     .append('path')
    //     .datum(dates)
    //     .attr('fill', 'none')
    //     .attr('stroke', 'brown')
    //     .attr('d', line()
    //         .x(d => x(new Date(d)))
    //         .y(d => y(weekly_data[yearMonthKey][d]['HISPANIC']))
    //     )
    //
    // g
    //     .append('path')
    //     .datum(dates)
    //     .attr('fill', 'none')
    //     .attr('stroke', '#C0C0C0')
    //     .attr('d', line()
    //         .x(d => x(new Date(d)))
    //         .y(d => y(weekly_data[yearMonthKey][d]['WHITE']))
    //     )
    //
    // g
    //     .append('path')
    //     .datum(dates)
    //     .attr('fill', 'none')
    //     .attr('stroke', 'yellow')
    //     .attr('d', line()
    //         .x(d => x(new Date(d)))
    //         .y(d => y(weekly_data[yearMonthKey][d]['ASIAN / PACIFIC ISLANDER']))
    //     )

}
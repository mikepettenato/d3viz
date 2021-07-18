import {select, selectAll} from 'd3-selection'
import {easeLinear} from 'd3-ease'

const martini_slides = [
    '2019-11',
    '2019-12',
    '2020-1',
    '2020-2',
    '2020-4',
    '2020-6',
    '2020-7'
]
const martini_controls =
    `
    <input id="previous" type="button" value="<" style="height:30px;" disabled> 
    <span id="month" class="controls">11</span><span class="controls">/</span>
    <span id="year" class="controls">2019</span> 
    <input id="next" type="button" value=">" style="height:30px">
    `

const free_explore_controls =
    `
    <input id="previous" type="button" value="<" style="height:30px"> 
    <span id="month" class="controls">1</span><span class="controls">/</span>
    <span id="year" class="controls">2019</span> 
    <input id="next" type="button" value=">" style="height:30px">
    `

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

const decrementDate = (yearStr, monthStr) => {
    let month = parseInt(monthStr)
    let year = parseInt(yearStr)
    month -= 1
    if (month < 1 && year == 2019) {
        month = 3
        year = 2021
    }else if (month < 1) {
        month = 12
        year -= 1
    }
    return {
        month: month,
        year: year
    }
}

const clearStartMessage = (start_svg_element) => {
    select(start_svg_element).selectAll('g.start').remove()
}
const startMessage = (start_svg_element) => {
    const svg = select(start_svg_element)
    const height = svg.attr("height")
    const width = svg.attr("width")

    console.log(width)
    const g = svg.append("g")
    g.attr("class", "start")
    g.append("text")
        .attr("x", width/2)
        .attr("y", height/2 + 5)
        .attr("text-anchor", "middle")
        .style('fill', 'gray')
        .style('font-size', '.75em')
        .text('← Start Here')

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

const clearFreeExploreMessage = (free_explore_svg) => {
    select(free_explore_svg).selectAll('g.free_explore').remove()
}
const freeExploreMessage = (free_explore_svg) => {
    const svg = select(free_explore_svg)
    const height = svg.attr("height")
    const width = svg.attr("width")

    console.log(width)
    const g = svg.append("g")
    g.attr("class", "free_explore")
    g.append("text")
        .attr("x", width/2)
        .attr("y", height/4 + 5)
        .attr("text-anchor", "middle")
        .style('fill', 'gray')
        .style('font-size', '.75em')
        .text('Additional Charts, Tooltips')
    g.append("text")
        .attr("x", width/2)
        .attr("y", height/2 + 5)
        .attr("text-anchor", "middle")
        .style('fill', 'gray')
        .style('font-size', '.75em')
        .text('and Controls Unlocked! Please Explore →')

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
export const MartiniControls = (martini_control_element, start_svg_element, free_explore_svg_element) => {
    let in_martini_stem = true
    let martini_index = 1
    const enablecontrols = () => {
        const martini_control_div = select(martini_control_element)
        if (in_martini_stem) {
            martini_control_div.html(martini_controls)
        }else{
            select("input#previous")
                .attr("disabled", null)
        }
    }

    startMessage(start_svg_element)

    const enableMartiniEvents = (bubbleChartControls, barChartControls, toolTipControls) => {
        select("#next").on("click", (e) => {
            if (in_martini_stem) {
                clearStartMessage(start_svg_element)
                //barChartControls.clearStartMessage()
                const date = martini_slides[martini_index]
                martini_index+= 1
                const year = date.split("-")[0]
                const month = date.split("-")[1]
                select("span#year").text((d) => {
                    return year
                })
                select("span#month").text((d) => {
                    return month
                })
                bubbleChartControls.forward()
                if (martini_index >= martini_slides.length) {
                    in_martini_stem = false
                    enablecontrols()
                    freeExploreMessage(free_explore_svg_element)
                    //barChartControls.freeExploreMessage()
                    bubbleChartControls.enableAnnotations()
                    toolTipControls.enable()
                    bubbleChartControls.enable()
                }
            }else {
                clearFreeExploreMessage(free_explore_svg_element)
                //barChartControls.clearFreeExploreMessage()
                const year = select("span#year").text()
                const month = select("span#month").text()
                const newDate = incrementDate(year, month)
                select("span#year").text((d) => {
                    return newDate.year
                })
                select("span#month").text((d) => {
                    return newDate.month
                })
                bubbleChartControls.forward()
            }
        })
        select("#previous").on("click", (e) => {
            clearFreeExploreMessage(free_explore_svg_element)
            //barChartControls.clearFreeExploreMessage()
            const year = select("span#year").text()
            const month = select("span#month").text()
            const newDate = decrementDate(year, month)
            select("span#year").text((d) => {
                return newDate.year
            })
            select("span#month").text((d) => {
                return newDate.month
            })
            bubbleChartControls.backwards()
        })
    }

    return {
        controls: enablecontrols,
        enableEvents: enableMartiniEvents
    }
}
'use strict';

const dashboardGraphWrapper = getElement('dashboardGraphWrapper');

const addGraph = (dataPoints, title, width, height, limits) => {
    const graphSettings = getGraphSettings(width, height);
    const graphData = getGraphData(dataPoints, graphSettings, limits);
    const canvas = addElement(dashboardGraphWrapper, dashBoardTemplate(width, height));
    const ctx = canvas.getContext('2d');
    drawAxis(ctx, graphSettings);
    populateXAxis(graphData.axesRange.x, ctx, graphSettings);
    populateYAxis(graphData.axesRange.y, ctx, graphSettings);
    // drawLineGraph(graphData, ctx, canvas);
    // ;
    window.setTimeout(() => drawLineGraph(graphData, ctx, canvas), 50);
    drawTitle(title, graphSettings, ctx);
}

const getGraphData = (dataPoints, graphSettings, limits) => {
    const axesRange = {
        x: getAxisRange(dataPoints, 'x'),
        y: getAxisRange(dataPoints, 'y', limits)
    }
    const dataPointsWithPosition = dataPoints.map(dp => setDataPointPosition(dp, graphSettings, axesRange));
    return {
        dataPoints: dataPointsWithPosition,
        axesRange: axesRange
    }
}

const setDataPointPosition = (dataPoint, gs, axesRange) => {
    const axisSpacing = axis => gs.axesLength[axis] / axesRange[axis].length;
    const recFindPos = (axis, accPos = 0, i = 0) => {
        if (dataPoint[axis] <= axesRange[axis][i]) return accPos;
        return recFindPos(axis, accPos + axisSpacing(axis), i + 1);
    }
    const percentXPos = recFindPos('x') + gs.leftPadding;
    const percentYPos = gs.yAxisLength - recFindPos('y') + gs.topPadding;
    return {
        ...dataPoint,
        percentXPos: percentXPos,
        percentYPos: percentYPos,
        pixelXPos: gs.xPos(percentXPos),
        pixelYPos: gs.yPos(percentYPos)
    }
}

const getAxisRange = (gd, axis, userLimits) => {
    const recfindArrLimits = (accLimits, i = 0) => {
        if (i >= gd.length) return accLimits;
        const min = gd[i][axis] < accLimits.min ? gd[i][axis] : accLimits.min;
        const max = gd[i][axis] > accLimits.max ? gd[i][axis] : accLimits.max;
        return recfindArrLimits({ min: min, max: max }, i + 1);
    }
    const limits = userLimits === undefined ?
        recfindArrLimits({ min: (gd[0][axis]), max: (gd[0][axis]) }) : userLimits;

    const recRange = accRange => {
        if (accRange.at(-1) >= limits.max) return accRange;
        return recRange([...accRange, increment(accRange.at(-1))]);
    }
    return recRange([limits.min]);
}

const increment = (n, inc = 1) => {
    if (typeof n === 'number') return n + inc;
    if (n instanceof Date) return new Date(new Date(new Date(n).setDate(n.getDate() + inc)).setHours(23, 59, 59, 0));
}

const drawAxis = (ctx, gs) => {
    ctx.beginPath();
    //move to top of y axis
    ctx.moveTo(gs.leftXPos, gs.topYPos);
    //draw to bottom of y axis (graph origin)
    ctx.lineTo(gs.leftXPos, gs.bottomYPos);
    //draw line to end of x axis
    ctx.lineTo(gs.rightXPos, gs.bottomYPos);
    ctx.stroke();
}

const populateXAxis = (timeLabels, ctx, gs) => {
    ctx.font = '12px serif';
    const dateIncrement = getDateIncrement(gs.xPos(gs.yAxisLength), timeLabels)
    const labelSpacing = gs.xAxisLength / timeLabels.length;
    timeLabels.forEach((timeLabel, i) => {
        const newXspace = i * labelSpacing;
        if(!dateIncrement.predicate(timeLabel) && i !== 0) return;
        ctx.beginPath();
        ctx.moveTo(gs.leftXPosPlus(newXspace), gs.bottomYPos);
        ctx.lineTo(gs.leftXPosPlus(newXspace), gs.bottomYPosPlus(1));
        ctx.stroke();

        ctx.save();
        ctx.translate(gs.leftXPosPlus(newXspace), gs.bottomYPos + 14);
        ctx.textAlign = "left";
        ctx.rotate(Math.PI / 3);
        ctx.fillText(dateToStr(timeLabel), 0, 0);
        ctx.restore();
    })
}
const getDateIncrement = (axisPixelLength, axisRange) => {
    const maxNumLabels = axisPixelLength / 15;
    return dateIncrementValues.find(incVal => (axisRange.length / incVal.incSize) < maxNumLabels);
}

const dateIncrementValues = [
    {
        incSize: 1,
        predicate: date => true,
        name: 'day'
    },{
        incSize: 7,
        predicate: date => date.getDay() === 1,
        name: 'week'
    },{
        incSize: 29,
        predicate: date => date.getDate() === 1,
        name: 'month'
    },{
        incSize: 116,
        predicate: date => [1, 4, 7, 10].some(n => n === date.getMonth()) && date.getDate() === 1,
        name: 'quater'
    },{
        incSize: 365,
        predicate: date => date.getMonth() === 1 && date.getDate() === 1,
        name: 'year'
    }
]

const populateYAxis = (axesRange, ctx, gs) => {
    ctx.font = '12px serif';
    ctx.textAlign = 'right';
    const increment = getIntIncrement(gs.yPos(gs.yAxisLength), axesRange);
    const labelSpacing = gs.yAxisLength / axesRange.length;

    axesRange.forEach((label, i) => {
        const newYspace = i * labelSpacing;
        if(i % increment !== 0) return;
        ctx.beginPath();
        ctx.moveTo(gs.leftXPos, gs.bottomYPosPlus(-newYspace));
        ctx.lineTo(gs.leftXPosPlus(-0.5), gs.bottomYPosPlus(-newYspace));
        ctx.stroke();
        ctx.fillText(label, gs.leftXPosPlus(-1), gs.bottomYPosPlus(1 - newYspace))
    })
}

const getIntIncrement = (axisPixelLength, axisRange) => {
    const intIncrementValues = [1, 5, 10, 20, 50, 100, 500, 1000];
    const maxNumLabels = axisPixelLength / 10;
    return intIncrementValues.find(incVal => (axisRange.length / incVal) < maxNumLabels);
}

const drawTitle = (graphTitle, gs, ctx) => {
    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    ctx.fillText(graphTitle, gs.width/2, 20);
}

const drawLineGraph = (gd, ctx, canvas) => {
    ctx.beginPath();
    ctx.moveTo(gd.dataPoints[0].pixelXPos, gd.dataPoints[0].pixelYPos);
    gd.dataPoints.forEach(dp => {
        ctx.lineTo(dp.pixelXPos, dp.pixelYPos);
        addElement(dashboardGraphWrapper, graphDataPointTemplate(absX(canvas, dp.pixelXPos), absY(canvas, dp.pixelYPos), dp));
    });
    ctx.stroke();
}


/**
 * Get the pixel locations of a point on the canvas given it's relative percentage location
 */
 const initGetXCoords = width => percentX => percentX / 100 * width;
 const initGetYCoords = height => percentY => percentY / 100 * height;
 
 /*
 *   Get the absoloute page pixel location given the canvas and the location (in pixels) on the canvas
 */
 const absX = (canvas, xPixels) => canvas.offsetLeft + xPixels;
 const absY = (canvas, yPixels) => canvas.offsetTop + yPixels;
 
 
 const getGraphSettings = (width, height) => {
     const relXPos = initGetXCoords(width);
     const relYPos = initGetYCoords(height);
     const bottomPadding = (60 / height) * 100;
     const leftPadding = (60 / width) * 100;
     const topPadding = (50 / width) * 100;
     const rightPadding = (40 / width) * 100;
     const xAxisLength = 100 - (leftPadding + rightPadding);
     const yAxisLength = 100 - (bottomPadding + topPadding);
     return {
         width: width,
         height: height,
         bottomPadding: bottomPadding,
         leftPadding: leftPadding,
         rightPadding: rightPadding,
         topPadding: topPadding,
         xAxisLength: xAxisLength,
         yAxisLength: yAxisLength,
         axesLength: {
             x: xAxisLength,
             y: yAxisLength
         },
         leftXPos: relXPos(leftPadding),
         rightXPos: relXPos(100 - rightPadding),
         bottomYPos: relYPos(100 - bottomPadding),
         topYPos: relYPos(topPadding),
         leftXPosPlus: n => relXPos(leftPadding + n),
         rightXPosPlus: n => relXPos((100 - rightPadding) + n),
         bottomYPosPlus: n => relYPos((100 - bottomPadding) + n),
         topYPosPlus: n => relYPos(topPadding + n),
         xPos: relXPos,
         yPos: relYPos
     }
 }
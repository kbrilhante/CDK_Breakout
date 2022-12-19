const canvas = document.querySelector("canvas"); // gets canvas from html
const maxCanvasSize = {
    width: 525,
    height: 700
}
initialize();

function initialize() {
    const viewport = getViewport();
    addEventListener('resize', resizeCanvas);
    checktopBar();
}

function checktopBar() {
    const topbar = document.querySelector(".topBar");
    if (topbar && !topbar.children.length) {
        setTimeout(() => {
            checktopBar();
        }, 100);
    } else {
        resizeCanvas();
    }
}

function resizeCanvas() {
    const viewport = getViewport();
    const body = document.querySelector('body');
    const container = document.querySelector(".canvas-container");
    const bodyContentList = document.querySelectorAll(".canvas-body-content");

    let availableWidth = viewport.width;
    availableWidth -= getYMeasurements(body)
    availableWidth -= getXMeasurements(container);
    availableWidth -= getXMeasurements(canvas);
    if (availableWidth <= maxCanvasSize.width) {
        availableWidth -= 20;
    } else {
        availableWidth = maxCanvasSize.width;
    }

    let availableHeight = viewport.height;
    availableHeight -= getYMeasurements(body);
    availableHeight -= getYMeasurements(container);
    availableHeight -= getYMeasurements(canvas);
    for (let i = 0; i < bodyContentList.length; i++) {
        const bodyContent = bodyContentList[i];
        const cs = getComputedStyle(bodyContent);
        availableHeight -= parseInt(cs.height);
        availableHeight -= getYMargin(bodyContent);
    }
    if (availableHeight <= maxCanvasSize.height) {
        availableHeight -= 10;
    } else {
        availableHeight = maxCanvasSize.height;
    }

    // check proportions
    if ((availableHeight * 3) === (availableWidth * 4)) {
        canvas.width = availableWidth;
        canvas.height = availableHeight;
    } else if ((availableHeight * 3) > (availableWidth * 4)) {
        canvas.width = availableWidth;
        canvas.height = availableWidth * 4/3;
    } else { // ((availableHeight * 3) < (availableWidth * 4))
        // console.log(availableWidth, availableHeight);
        canvas.height = availableHeight;
        canvas.width = availableHeight * 3/4;
    }
}

function getXMeasurements(element) {
    let xMeasurements = 0;
    const computedStyle = getComputedStyle(element);
    xMeasurements += parseInt(computedStyle.marginLeft);
    xMeasurements += parseInt(computedStyle.marginRight);
    xMeasurements += parseInt(computedStyle.borderLeftWidth);
    xMeasurements += parseInt(computedStyle.borderRightWidth);
    xMeasurements += parseInt(computedStyle.paddingLeft);
    xMeasurements += parseInt(computedStyle.paddingRight);
    return xMeasurements;
}

function getYMeasurements(element) {
    let yMeasurements = 0;
    const computedStyle = getComputedStyle(element);
    yMeasurements += parseInt(computedStyle.marginTop);
    yMeasurements += parseInt(computedStyle.marginBottom);
    yMeasurements += parseInt(computedStyle.borderTopWidth);
    yMeasurements += parseInt(computedStyle.borderBottomWidth);
    yMeasurements += parseInt(computedStyle.paddingTop);
    yMeasurements += parseInt(computedStyle.paddingBottom);
    return yMeasurements;
}

function getYMargin(element) {
    let yMeasurements = 0;
    const computedStyle = getComputedStyle(element);
    yMeasurements += parseInt(computedStyle.marginTop);
    yMeasurements += parseInt(computedStyle.marginBottom);
    return yMeasurements;
}

function getViewport() {
    let vp = {};

    if (typeof window.innerWidth != 'undefined') {
        vp.width = window.innerWidth;
        vp.height = window.innerHeight;
    } else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth != 'undefined' && document.documentElement.clientWidth != 0) {
        vp.width = document.documentElement.clientWidth;
        vp.height = document.documentElement.clientHeight;
    } else {
        vp.width = document.querySelector('body').clientWidth;
        vp.height = document.querySelector('body').clientHeight;
    }
    return vp;
}
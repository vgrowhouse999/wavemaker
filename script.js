let settings = {
    amplitudeX: 100,
    amplitudeY: 20,
    lines: 20,
    hueStartColor: 53,
    saturationStartColor: 74,
    lightnessStartColor: 67,
    hueEndColor: 216,
    saturationEndColor: 100,
    lightnessEndColor: 7,
    smoothness: 3,
    offsetX: 10,
    fill: true,
    crazyness: false
};

let svg = document.getElementById('svg'),
    winW = window.innerWidth,
    winH = window.innerHeight,
    Colors = [],
    Paths = [],
    Mouse = {
        x: winW / 2,
        y: winH / 2
    },
    overflow,
    startColor,
    endColor,
    gui;

class Path {
    constructor(y, fill, offsetX) {
        this.rootY = y;
        this.fill = fill;
        this.offsetX = offsetX;
    }

    createRoot() {
        this.root = [];
        let offsetX = this.offsetX;
        let x = -overflow + offsetX;
        let y = 0;
        let rootY = this.rootY;
        let upSideDown = 0;

        this.root.push({ x: x, y: rootY });

        while (x < winW) {
            let value = Math.random() > 0.5 ? 1 : -1;

            if (settings.crazyness) {
                x += parseInt((Math.random() * settings.amplitudeX / 2) + (settings.amplitudeX / 2));
                y = (parseInt((Math.random() * settings.amplitudeY / 2) + (settings.amplitudeY / 2)) * value) + rootY;
            } else {
                upSideDown = !upSideDown;
                value = (upSideDown == 0) ? 1 : -1;
                x += settings.amplitudeX;
                y = settings.amplitudeY * value + rootY;
            }

            this.root.push({ x: x, y: y });
        }

        this.root.push({ x: winW + overflow, y: rootY });
    }

    createCircles() {
        const fill = '#fff';
        this.root.forEach(function(key) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('r', 1);
            circle.setAttribute('cx', key.x);
            circle.setAttribute('cy', key.y);
            circle.setAttribute('fill', 'rgba(255, 255, 255, .3)');
            svg.appendChild(circle);
        });
    }

    createPath() {
        const root = this.root;
        const fill = this.fill;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('fill', fill);
        path.setAttribute('stroke', fill);
        svg.appendChild(path);
        if (settings.fill) {
            svg.setAttribute('class', 'path');
        } else {
            svg.setAttribute('class', 'stroke');
        }

        let d = `M -${overflow} ${winH + overflow}`;
        d += ` L ${root[0].x} ${root[0].y}`;

        for (let i = 1; i < this.root.length - 1; i++) {
            let prevPoint = root[i - 1];
            let actualPoint = root[i];
            let diffX = (actualPoint.x - prevPoint.x) / settings.smoothness;
            let x1 = prevPoint.x + diffX;
            let x2 = actualPoint.x - diffX;
            let x = actualPoint.x;
            let y1 = prevPoint.y;
            let y2 = actualPoint.y;
            let y = actualPoint.y;

            d += ` C ${x1} ${y1}, ${x2} ${y2}, ${x} ${y}`;
        }

        const reverseRoot = root.reverse();
        d += ` L ${reverseRoot[0].x} ${reverseRoot[0].y}`;
        root.reverse();

        d += ` L ${winW + overflow} ${winH + overflow}`;
        d += ` Z`;

        path.setAttribute('d', d);
    }
}

function init() {
    overflow = Math.abs(settings.lines * settings.offsetX);

    startColor = `hsl(${settings.hueStartColor}, ${settings.saturationStartColor}%, ${settings.lightnessStartColor}%)`;
    endColor = `hsl(${settings.hueEndColor}, ${settings.saturationEndColor}%, ${settings.lightnessEndColor}%)`;
    Colors = chroma.scale([startColor, endColor]).mode('lch').colors(settings.lines + 2);

    Paths = [];
    document.body.removeChild(svg);
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute('id', 'svg');
    document.body.appendChild(svg);

    if (settings.fill) {
        svg.style.backgroundColor = Colors[0];
    } else {
        svg.style.backgroundColor = '#000';
    }

    for (let i = 0; i < settings.lines + 1; i++) {
        let rootY = parseInt(winH / settings.lines * i);
        const path = new Path(rootY, Colors[i + 1], settings.offsetX * i);
        Paths.push(path);
        path.createRoot();
    }
    Paths.forEach(function(path) {
        path.createPath();
    });
}

init();

window.addEventListener('resize', function() {
    winW = window.innerWidth;
    winH = window.innerHeight;
    init();
});

function datgui() {
    gui = new dat.GUI();

    let guiSettings = gui.addFolder('Settings');
    guiSettings.add(settings, 'lines', 5, 50).step(1).onChange(init);
    guiSettings.add(settings, 'amplitudeX', 20, 300).step(1).onChange(init);
    guiSettings.add(settings, 'amplitudeY', 0, 200).step(1).onChange(init);
    guiSettings.add(settings, 'offsetX', -20, 20).step(1).onChange(init);
    guiSettings.add(settings, 'smoothness', 0.5, 10).step(0.2).onChange(init);
    guiSettings.add(settings, 'fill', false).onChange(init);
    guiSettings.add(settings, 'crazyness', false).onChange(init);
    guiSettings.open();

    let guiStartColor = gui.addFolder('Start Color');
    guiStartColor.add(settings, 'hueStartColor', 0, 360).step(1).onChange(init);
    guiStartColor.add(settings, 'saturationStartColor', 0, 100).step(1).onChange(init);
    guiStartColor.add(settings, 'lightnessStartColor', 0, 100).step(1).onChange(init);
    guiStartColor.open();

    let guiEndColor = gui.addFolder('End Color');
    guiEndColor.add(settings, 'hueEndColor', 0, 360).step(1).onChange(init);
    guiEndColor.add(settings, 'saturationEndColor', 0, 100).step(1).onChange(init);
    guiEndColor.add(settings, 'lightnessEndColor', 0, 100).step(1).onChange(init);
    guiEndColor.open();

    let guiRandomize = { randomize: function() { randomize(); } };
    gui.add(guiRandomize, 'randomize');

    return gui;
}

datgui();

function randomize() {
    settings = {
        lines: parseInt(5 + Math.random() * 45),
        amplitudeX: parseInt(20 + Math.random() * 300),
        amplitudeY: parseInt(Math.random() * 200),
        hueStartColor: parseInt(Math.random() * 360),
        saturationStartColor: 74,
        lightnessStartColor: 67,
        hueEndColor: parseInt(Math.random() * 360),
        saturationEndColor: 90,
        lightnessEndColor: 14,
        smoothness: 1 + parseInt(Math.random() * 9),
        offsetX: parseInt(-20 + Math.random() * 40),
        fill: Math.random() * 1 > 0.3 ? true : false,
        crazyness: Math.random() * 1 > 0.9 ? true : false
    }
    init();
    gui.destroy();
    datgui();
}

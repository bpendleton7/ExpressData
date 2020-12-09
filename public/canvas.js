let canvas = document.getElementById("graphCanvas");

let ctx = canvas.getContext("2d");

const drawNumber = (ctx, x, y, value, qWidth) => {
    ctx.fillStyle = "#000";
    ctx.font = '18px Tahoma';
    let txt = ctx.measureText(value.value + ":" + value.question);
    ctx.globalAlpha = .5;
    const bgHeight = 24;
    ctx.fillRect(x-(txt.width/2), y-bgHeight+6, txt.width, bgHeight);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#FFF";
    ctx.fillText(value.value + ":" + value.question, x-(txt.width/2), y);
}

const drawPercentageBar = (ctx, offsets, q1, q2, q3, q4) => {
    let total = q1.value + q2.value + q3.value + q4.value;
    let bounds = [
        {
            "width": (canvas.width-offsets.x)*(q1.value/total),
            "color": "#37463C"
        },
        {
            "width": (canvas.width-offsets.x)*(q2.value/total),
            "color": "#535F51"
        },
        {
            "width": (canvas.width-offsets.x)*(q3.value/total),
            "color": "#79816E"
        },
        {
            "width": (canvas.width-offsets.x)*(q4.value/total),
            "color": "#BDBDA1"
        }
    ]

    //Gross yuck but it's faster than figuiring out the loop bug
    ctx.fillStyle=bounds[0].color;
    ctx.fillRect(offsets.x, offsets.y, bounds[0].width + offsets.x, offsets.thickness);
    
    ctx.fillStyle=bounds[1].color;
    ctx.fillRect(bounds[0].width + offsets.x, offsets.y, bounds[1].width + offsets.x, offsets.thickness);
    
    ctx.fillStyle=bounds[2].color;
    ctx.fillRect(bounds[0].width + bounds[1].width + offsets.x, offsets.y, bounds[2].width + offsets.x, offsets.thickness);
    
    ctx.fillStyle=bounds[3].color;
    ctx.fillRect(bounds[0].width + bounds[1].width + bounds[2].width + offsets.x, offsets.y, bounds[3].width + offsets.x, offsets.thickness);

    
    drawNumber(ctx, ((bounds[0].width)/2)+offsets.x, 26 + offsets.y + (offsets.thickness/2), q1, bounds[0].width);
    drawNumber(ctx, bounds[0].width+(bounds[1].width/2), offsets.y + (offsets.thickness/2), q2, bounds[1].width);
    drawNumber(ctx, (bounds[0].width+bounds[1].width)+(bounds[2].width/2), 26 + offsets.y + (offsets.thickness/2), q3, bounds[2].width);
    drawNumber(ctx, (bounds[0].width+bounds[1].width+bounds[2].width)+(bounds[3].width/2), offsets.y + (offsets.thickness/2), q4, bounds[3].width);
}

fetch("/api")
.then(res => res.json())
.then(questions => {
    drawGraph(questions);
})


const drawGraph = questions => {
    let qlist = Object.entries(questions)
    let yHeight = canvas.height/qlist.length;
    console.log(yHeight);
    qlist.forEach((q, index) => {
        const question = q[0];
        const responses = q[1];
        let values = [];
        Object.entries(responses).forEach(item => {
            values.push({value: item[1], question: item[0]});
        });
        console.log(values);
        
        drawPercentageBar(ctx, {
            x: 0,
            y: index * yHeight,
            thickness: yHeight
        }, values[0], values[1], values[2], values[3]);
    
        if(index > 0) {
            ctx.fillStyle="#000"
            ctx.fillRect(0, index * yHeight, canvas.width, 2)
        }
    
        ctx.font = '18px serif';
        let txt = ctx.measureText(question);
        
        const center = (canvas.width/2) - txt.width/2;
    
        const verticalOffset = 40;

        ctx.fillStyle="#000"
        ctx.globalAlpha = .5;
        ctx.fillRect(center - 5, ((index * yHeight) + yHeight/2) + 5 - verticalOffset, txt.width + 10, -20);
        
        ctx.fillStyle="#FFF"
        ctx.globalAlpha = 1;
        ctx.fillText(question, center, ((index * yHeight) + yHeight/2) - verticalOffset);
    });    
}
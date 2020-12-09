function drawLine(ctx, startX, startY, endX, endY,color){
    ctx.save();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(startX,startY);
    ctx.lineTo(endX,endY);
    ctx.stroke();
    ctx.restore();
}

function drawBar(ctx, upperLeftCornerX, upperLeftCornerY, width, height,color){
    ctx.save();
    ctx.fillStyle=color;
    ctx.fillRect(upperLeftCornerX,upperLeftCornerY,width,height);
    ctx.restore();
}

var myCanvas = document.getElementById("myCanvas");
myCanvas.width = 500;
myCanvas.height = 500;
  
var ctx = myCanvas.getContext("2d");


fetch ('/api').then(res=>res.json()).then(data=>{
    console.log(data)
    let q1=data['Which of the following is the oldest of these computers by release date?'];
    let q2=data['Who became Prime Minister of the United Kingdom in July 2016?'];
    let q3=data['Who created the "Metal Gear" Series?'];
    var questions ={
        "answer1" : q1['Apple 3'],
        "answer2" : q1['Commodore 64'],
        "answer3" : q1['TRS-80'],
        "answer4" : q1['ZX Spectrum'],
        "space" : 0,
        "answer5" : q2['Boris Johnson'],
        "answer6" : q2['David Cameron'],
        "answer7" : q2['Theresa May'],
        "answer8" : q2['Tony Blair'],
        "space2" : 0,
        "answer9" : q3['Gunpei Yokoi'],
        "answer10" : q3['Hideo Kojima'],
        "answer11" : q3['Hiroshi Yamauchi'],
        "answer12" : q3['Shigeru Miyamoto']
    }

    var Barchart = function(options){
        this.options = options;
        this.canvas = options.canvas;
        this.ctx = this.canvas.getContext("2d");
        this.colors = options.colors;
      
        this.draw = function(){
            var maxValue = 0;
            for (var categ in this.options.data){
                maxValue = Math.max(maxValue,this.options.data[categ]);
            }
            var canvasActualHeight = this.canvas.height - this.options.padding * 2;
            var canvasActualWidth = this.canvas.width - this.options.padding * 2;
     
            //drawing the grid lines
            var gridValue = 0;
            while (gridValue <= maxValue){
                var gridY = canvasActualHeight * (1 - gridValue/maxValue) + this.options.padding;
                drawLine(
                    this.ctx,
                    0,
                    gridY,
                    this.canvas.width,
                    gridY,
                    this.options.gridColor
                );
                 
                //writing grid markers
                this.ctx.save();
                this.ctx.fillStyle = this.options.gridColor;
                this.ctx.font = "bold 10px Arial";
                this.ctx.fillText(gridValue, 10,gridY - 2);
                this.ctx.restore();
     
                gridValue+=this.options.gridScale;
            }
      
            //drawing the bars
            var barIndex = 0;
            var numberOfBars = Object.keys(this.options.data).length;
            var barSize = (canvasActualWidth)/numberOfBars;
     
            for (categ in this.options.data){
                var val = this.options.data[categ];
                var barHeight = Math.round( canvasActualHeight * val/maxValue) ;
                drawBar(
                    this.ctx,
                    this.options.padding + barIndex * barSize,
                    this.canvas.height - barHeight - this.options.padding,
                    barSize,
                    barHeight,
                    this.colors[barIndex%this.colors.length]
                );
                this.ctx.save();
                this.ctx.textBaseline="bottom";
                this.ctx.textAlign="center";
                this.ctx.fillStyle = "#000000";
                this.ctx.font = "bold 14px Arial";
                this.ctx.fillText(this.options.seriesName, this.canvas.width/2,this.canvas.height);
                this.ctx.restore();  
                barIndex++;
            }
      
        }
    }
    
    var myBarchart = new Barchart(
        {
            canvas:myCanvas,
            seriesName:"Question 1                         Question 2                         Question 3",
            padding:25,
            gridScale:1,
            gridColor:"#000000",
            data:questions,
            colors:["#36453B","#C2C1A5"]
        }
    );
    myBarchart.draw();
}) 

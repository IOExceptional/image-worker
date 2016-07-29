var canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d'),
    img = new Image(),
    timerInterval = null,
    screens = [
            {
                width: 1024,
                height: 768
            },
            {
                width: 768,
                height: 1024
            }
        ],
    color = '#117744';

function sendImage() {
    'use strict';

    var splashes = [];

    var results = document.getElementById('results');
    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    screens.forEach(function (screen) {

        var worker = new Worker('worker.js');

        worker.postMessage([screen.width, screen.height, color, imgData, canvas.width, canvas.height]);

        worker.onmessage = function (msg) {
            var newCanv = document.createElement('canvas');

            newCanv.width = screen.width;
            newCanv.height = screen.height;

            var ctx = newCanv.getContext('2d');

            var imageData = ctx.getImageData(0, 0, newCanv.width, newCanv.height);
            var responseData = msg.data[0];

            for(var i = 0; i < imageData.data.length; i += 4) {

                imageData.data[i] = responseData[i];
                imageData.data[i + 1] = responseData[i + 1];
                imageData.data[i + 2] = responseData[i + 2];
                imageData.data[i + 3] = responseData[i + 3];
            }

            ctx.putImageData(imageData, 0, 0);

            results.appendChild(newCanv);

            splashes.push(responseData);

            if(splashes.length === screens.length) {
                clearInterval(timerInterval);
            }
        };
    });

    var timer = document.getElementById('timer'),
        iterations = 0;

    timer.innerText = 0;

    timerInterval = setInterval(function () {
        timer.innerText = ++iterations;
    }, 1000);
}

img.src = 'bastion.png';
img.onload = function () {
    'use strict';

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);
};

document.getElementById('dowork').onclick = sendImage;

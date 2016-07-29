
// R, G, B, A
var imageDepth = 4;

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function ImageOverlayProcessor (width, height, backgroundColor) {

    this.width = width;
    this.height = height;

    this.backgroundColor = backgroundColor;

    this.imageData = new Array(width * height * imageDepth);

    this.initialiseData();
}

ImageOverlayProcessor.prototype.initialiseData = function () {

    var color = hexToRgb(this.backgroundColor);

    for(var i = 0; i < this.imageData.length; i += 4) {

        this.imageData[i] = color.r; // Red
        this.imageData[i + 1] = color.g; // Green
        this.imageData[i + 2] = color.b; // Blue
        this.imageData[i + 3] = 255; // Alpha
    }
};

ImageOverlayProcessor.prototype.overlayImage = function (imageData, width, height) {
    //find center x,y of existing image
    var existingCenter = {
        x: this.width/2,
        y: this.height/2
    };

    //find center x,y of new image
    var newCenter = {
        x: width/2,
        y: height/2
    };


    //find top left x,y position of new image against existing image
    var leftSideStart = existingCenter.x - newCenter.x,
        topSideStart = existingCenter.y - newCenter.y;

    var existingImageStartPos = {
        x: leftSideStart < 0 ? 0 : leftSideStart,
        y: topSideStart < 0 ? 0 : topSideStart
    };

    var newImageStartPos = {
        x: leftSideStart < 0 ? Math.abs(leftSideStart) : 0,
        y: topSideStart < 0 ? Math.abs(topSideStart) : 0
    };

    var overlayWidth = this.width < width ? this.width : width,
        overlayHeight = this.height < height ? this.height : height;

    //rewrite the pixels
    for(var y = 0; y < overlayHeight; y++) {

        var currentExistingY = existingImageStartPos.y + y,
            currentNewImageY = newImageStartPos.y + y;

        for(var x = 0; x < overlayWidth; x++) {

            var currentExistingX = existingImageStartPos.x + x,
                currentNewImageX = newImageStartPos.x + x;

            var currentExistingElement = ((this.width * currentExistingY) + currentExistingX) * 4,
                currentNewElement = ((width * currentNewImageY) + currentNewImageX) * 4;

            this.imageData[currentExistingElement]      = imageData.data[currentNewElement];
            this.imageData[currentExistingElement + 1]  = imageData.data[currentNewElement + 1];
            this.imageData[currentExistingElement + 2]  = imageData.data[currentNewElement + 2];
            this.imageData[currentExistingElement + 3]  = imageData.data[currentNewElement + 3];
            this.imageData[currentExistingElement + 4]  = 255;
        }
    }
};


self.onmessage = function (msg) {

    var processor = new ImageOverlayProcessor(msg.data[0], msg.data[1], msg.data[2]);

    processor.overlayImage(msg.data[3], msg.data[4], msg.data[5]);

    var imageCopy = processor.imageData.slice();

    self.postMessage([imageCopy]);
};

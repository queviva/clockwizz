//////////////////////////////////////////////////
// queviva - clock|anti|wise mousemove detector
/*
//
//
//
*/
/*global CustomEvent*/
//////////////////////////////////////////////////

(() => { // anonymouse closure


    let

    // for holding a list of mouse coords
    coords = [
        {x:0,y:0},
        {x:0,y:0},
        {x:0,y:0}
    ],
    
    // for holding the clock|anti values
    clockVals = [],
    
    // the clock values array reduced to a sum
    clockSum = 0,
    
    // for storing the angles
    atans = [],
    
    // for storing the deltas
    deltas = [],
    
    // a reference to the clockWisdom script
    wizeScript = document.querySelector(
        'script[data-type="clockWisdom"]'
    ),
    
    // a reference to the clockWisdom data
    wizeData = wizeScript.dataset,
    
    // the number of points to hold in buffer 
    coordsBuff =
     
        // either get it from the data in the tag
        parseInt(wizeData.buff, 10)
        
        || //or
        
        // use default
        40,
        
    // the percent of coords that must be fulfilled
    coordsPercent = 
    
        // either get it from the data in the tag
        parseFloat(wizeData.perc)
        
        // or
        ||
        
        // use default
        0.2,
        
    // the current direction to send to listeners
    curDir = 0;
    
        
    //////////////////////////////////////////////////
    
    // fill the clockVals and atans with 0's at first
    for(let i = 0, j = coordsBuff; i < j; i++) {
        clockVals[i] = 0;
        atans[i] = 0;
        deltas[i] = 0;
    }
    
    // a handler for the moves
    function handleMove (xVal, yVal) {
        
        // remove the last coordinate
        coords.pop();
        
        // put the newset coordinate on the front
        coords.unshift({x : xVal, y: yVal});
        
        // remove the last angle
        atans.pop();
        deltas.pop();
        
        // add the newest angle to the front
        atans.unshift(
            Math.atan2(
                coords[1].y - coords[0].y,
                coords[1].x - coords[0].x
            )
        );
        deltas.unshift(
            Math.max(
                Math.abs(coords[1].x - coords[0].x),
                Math.abs(coords[1].y - coords[0].y)
            )
        );
        
        // remove the last clock value
        clockVals.pop();
        
        // put the newest clock value on the front
        clockVals.unshift(
           atans[0] > atans[1] ? 0 : 1
        );
        
        // reduce the clock values to a sum
        clockSum = clockVals.reduce((t,n) => t + n);
        
        // determine the direction from the sum
        curDir = 
            clockSum < coordsPercent * coordsBuff ?
            1
            :
            clockSum > (1-coordsPercent) * coordsBuff ?
            -1
            :
            0;
            
        // compute the deltas
        //for(let i = 0, j = atans.length - 1; i < j; i++){
        //for(let i = 0, j = coords.length - 1; i < j; i++){
        //    deltas[i] = (atans[i+1] - atans[i]);
        //}
        
        // find the average delta
        let meanD = deltas.reduce((t,n)=>t+n) / deltas.length;
            
        
        wizeScript.dispatchEvent(
            new CustomEvent(
                'clockChange',
                {detail: {
                    dir : curDir,
                    speed : meanD
                    /*
                        Math.abs(atans[1] - atans[0])
                        > 0.02 ?
                        'fast' : 'slow'
                        */
                }}
            )
        );
        
    }
    
    let touchStartHandler = e => {
        
        window.removeEventListener('touchstart', touchStartHandler);
        window.removeEventListener('mousemove', mouseHandler);
        window.addEventListener('touchmove', e => {
            
            handleMove(
                e.touches[0].pageX,
                e.touches[0].pageY,
            );
        }, {passive: true});
        
    };
    
    let mouseHandler = e => handleMove(e.pageX, e.pageY);
    
    window.addEventListener('touchstart', touchStartHandler);
    window.addEventListener('mousemove', mouseHandler);
    
})(); // selfie on the moon
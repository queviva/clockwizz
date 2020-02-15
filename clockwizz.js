//////////////////////////////////////////////////
// queviva - clock|anti-clock|wizz-motion detector
//
//  = send -1 0 1  based on clockmove
//  = send magnitude
//
/*global CustomEvent*/// for c9 editing
//////////////////////////////////////////////////

// window load closure for all clockwizz objs in the page
window.addEventListener('load', e => {
    
    let opts = // can NOT use document.currentScript
        document.querySelector('script[id="wizzScript"]') &&
        document.querySelector('script[id="wizzScript"]').dataset ?
        document.querySelector('script[id="wizzScript"]').dataset :
        {};
    
    opts = opts.wizz ? JSON.parse(opts.wizz) : {};
    
    // the default prefs for all WizzerObjs themselves
    const defPrefs = {
        mouseEventName : 'mousewizz',
        touchEventName : 'touchwizz'
    };
    
    // an object for holding buffer values
    const WizzBuffer = function(eventName) {
        this.coords = [];
        this.atans = [];
        this.deltas = [];
        this.eventName = eventName;
    };

    // method to blank all values in a buffer
    WizzBuffer.prototype.blankAllVals = function() {

        this.coords = [];
        this.atans = [];
        this.deltas = [];

        // loop through making everything zero
        for (let i = 0, j = 5; i < j; i++) {
            this.coords[i] = { x: 0, y: 0 };
            this.atans[i] = 0;
            this.deltas[i] = 0;
        }

        // add one more for the coords
        this.coords[this.coords.length] = { x: 0, y: 0 };

        // take one off for the deltas
        this.deltas.pop();

    };

    // the wizzer object itself
    const WizzerObj = function(obj) {

        // the prefs holder for this specific wizzer
        this.prefs = {};

        // get any prefs set in individual tag data-wizz param
        let dataPrefs = obj.dataset.wizz ? JSON.parse(obj.dataset.wizz) : {};

        // if any valid prefs were given, set them
        for (let p in defPrefs) {
            this.prefs[p] = dataPrefs[p] ? dataPrefs[p] : defPrefs[p];
        }
        
        // reference to the html element
        this.obj = obj;
        
        // the default threshold angles in degrees
        this.threshold = { min: 2, max: 90 };

        // create both mouse and touch buffers
        this.mouseBuff = new WizzBuffer(this.prefs.mouseEventName);
        this.touchBuff = new WizzBuffer(this.prefs.touchEventName);

        // blank the buffers on start
        this.mouseBuff.blankAllVals();
        this.touchBuff.blankAllVals();

        // method for calculating the wizz
        this.wizzHandler = (e, xVal, yVal, buff) => {

            // chop the first coord off
            buff.coords.shift();

            // put the new coord on the end
            buff.coords.push({ x: xVal, y: yVal });

            // calc the atans
            for (let i = 1, j = buff.coords.length; i < j; i++) {

                // get the angle between ...
                buff.atans[i - 1] = (Math.atan2(

                    // the first coord in the list
                    // and every other coord
                    buff.coords[i].y - buff.coords[0].y,
                    buff.coords[i].x - buff.coords[0].x

                    // convert to degrees
                ) * (180 / Math.PI));

            }

            // compute the deltas between the angles
            for (let i = 1, j = buff.atans.length; i < j; i++) {

                let tmp = buff.atans[i] - buff.atans[i - 1];

                // adjust for 360
                tmp =
                    tmp > 180 ? tmp - 360 :
                    tmp < -180 ? tmp + 360 :
                    tmp;

                buff.deltas[i - 1] = tmp;
            }

            // default the direction to no-turn
            let dir = 0;

            // get magnitudes of all deltas
            let absDeltas = buff.deltas.map((v, i) =>

                // zero out all the extremes
                Math.abs(v) > this.threshold.max ||
                Math.abs(v) < this.threshold.min ?
                0.000069 : Math.abs(v)

            );


            // get the maxDelta
            let maxDelta = Math.max(...absDeltas);

            // get the sign of the final delta and ...
            let sgnFinalDelta = Math.sign(buff.deltas[buff.deltas.length - 1]);

            // if ...
            if (

                // the final delta is not zero
                sgnFinalDelta !== 0

                // and ...
                &&

                // all the deltas ...
                buff.deltas.every(v =>

                    // have the same sign as the final ...
                    Math.sign(v) === sgnFinalDelta

                )

                // and
                &&

                // none of the absDeltas is zero
                absDeltas.every(v => v !== 0)

                // and
                &&

                // all of the absDeltas exceeds the min
                absDeltas.every(v => v > this.threshold.min)

                // and
                &&

                // none of the absDeltas exceeds the max
                absDeltas.every(v => v < this.threshold.max)

            ) {

                // then set the dir to that
                dir = sgnFinalDelta;

            }

            // dispatch the wizz
            obj.dispatchEvent(new CustomEvent(buff.eventName, {
                detail: {
                    direction: dir,
                    mag: Math.max(
                        Math.abs(
                            buff.coords[0].x - buff.coords[buff.coords.length - 1].x
                        ),
                        Math.abs(
                            buff.coords[0].y - buff.coords[buff.coords.length - 1].y
                        )
                    )
                }
            }));
            
            
            e.preventDefault();
            e.stopPropagation();

        };

        // handler for touch starting
        this.touchInit = e => {

            // remove this very listener from the obj
            obj.removeEventListener('touchstart', this.touchInit);

            // add the touch version of the wizzHandler
            obj.addEventListener('touchmove', this.touchWizz, { passive: false});
            
            // add the touch stop listener
            obj.addEventListener('touchend', this.touchEnd);

        };

        // what to do when the touch stops
        this.touchEnd = e => {

            // remove this very listener
            obj.removeEventListener('touchend', this.touchEnd);

            // remove the touch move handler
            obj.removeEventListener('touchmove', this.touchWizz);

            // add the touch start listener back
            obj.addEventListener('touchstart', this.touchInit);

            // reset everything to zero
            this.touchBuff.blankAllVals();

        };

        // for dealing with the first mouse instance
        this.mouseInit = e => {

            // remove this very listener from the obj
            obj.removeEventListener('mousedown', this.mouseInit);

            // add the mouse version of the wizzHandler
            //obj.addEventListener('pointermove', this.mouseWizz, { passive: false});
            window.addEventListener('pointermove', this.mouseWizz, { passive: false});

            // add the mouse stop listener
            //obj.addEventListener('mouseleave', this.mouseEnd);
            window.addEventListener('mouseup', this.mouseEnd);

        };

        // what to do when the mouse goes up
        this.mouseEnd = e => {

            // remove this very listener
            window.removeEventListener('mouseup', this.mouseEnd);

            // remove the mouse move handler
            window.removeEventListener('pointermove', this.mouseWizz);

            // add the mouse init listener back
            obj.addEventListener('mousedown', this.mouseInit);

            // reset everything to zero
            this.mouseBuff.blankAllVals();

        };

        // method to pass touch coords to the wizzHandler
        this.touchWizz = e => {
            this.wizzHandler(e, e.touches[0].pageX, e.touches[0].pageY, this.touchBuff);
        };

        // method to pass mouse coords to the wizzHandler
        this.mouseWizz = e => {
            this.wizzHandler(e, e.pageX, e.pageY, this.mouseBuff);
        };

        // begin with the touch start listener on
        obj.addEventListener('touchstart', this.touchInit);

        // also begin with mouse start listener on
        obj.addEventListener('mousedown', this.mouseInit);

    };
    
    // over-rite default prefs with options from script's data-wizz param
    for (let p in opts) {
        
        // ... IF they exist in the default preferences
        if (defPrefs[p] !== undefined) defPrefs[p] = opts[p];
    }
    
    // get all of the elements that ...
    document.querySelectorAll(
        
        // match the specified css-selector string ...
        opts.selector
        
        // OR just use the default css-selector string
        || '.clockwizz'
        
    )
    
    
    // .then loop through all of those objects
    .forEach(obj => {
    
        // making each one into clock wizzers
        //this[obj.id] = new WizzerObj(obj);
        new WizzerObj(obj);

    });

});
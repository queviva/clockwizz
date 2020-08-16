//////////////////////////////////////////////////
// queviva - clock|anti-clock|wizz-motion detector
//
//  = send -1 0 1  based on clockmove
//  = send magnitude
//
//////////////////////////////////////////////////

// anonymouse closure
(function() {

    // debugg {
    //'use strict';
    //'use strong';
    // localStorage.clear();
    //}

    // default prefs for all WizzerObjs themselves {
    const defPrefs = {
        selector: 'wizz',
        mouseEventName: 'mousewizz',
        touchEventName: 'touchwizz'
    };
    //}

    // try to get options set in script's data-params {
    const opts = JSON.parse(((document.querySelector(
        'script[src*="clockwizz"][src$=".js"]'
    ) || {}).dataset || {}).wizz || '{}');
    //}

    // over-rite default prefs with script's data-wizz param {
    for (let p in opts) {

        // ... IF they exist in the default preferences
        if (defPrefs[p] !== undefined) defPrefs[p] = opts[p]
        
            // strip out anything that isn't letters or dash
            .replace(/[^a-z-]/gi,'');

    }
    //}

    // an object for holding buffer values {
    const WizzBuffer = function(eventName) {
        this.coords = [];
        this.atans = [];
        this.deltas = [];
        this.eventName = eventName;
    };
    //}

    // method to blank all values in a buffer {
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
    //}
    
    // lizzers {
    
    // method for calculating the wizz
    const wizzHandler = (e, clock, xVal, yVal, buff) => {

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
            Math.abs(v) > clock.threshold.max ||
            Math.abs(v) < clock.threshold.min ?
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
            absDeltas.every(v => v > clock.threshold.min)

            // and
            &&

            // none of the absDeltas exceeds the max
            absDeltas.every(v => v < clock.threshold.max)

        ) {

            // then set the dir to that
            dir = sgnFinalDelta;

        }

        // dispatch the wizz
        clock.obj.dispatchEvent(new CustomEvent(buff.eventName, {
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

    // touch initializer
    const touchInit = (e, clock) => {

        // remove the very listener
        clock.obj.removeEventListener('touchstart', clock.touchInit);

        // add the touch version of the wizzHandler
        clock.obj.addEventListener('touchmove', clock.touchWizz, { passive: false });

        // add the touch stop listener
        clock.obj.addEventListener('touchend', clock.touchEnd);

    };

    // remover|resetter on touch end
    const touchEnd = (e, clock) => {

        // remove the very listener
        clock.obj.removeEventListener('touchend', clock.touchEnd);

        // remove the touch move handler
        clock.obj.removeEventListener('touchmove', clock.touchWizz);

        // re-add the touch initialization listener
        clock.obj.addEventListener('touchstart', clock.touchInit);

        // reset everything to zero
        clock.touchBuff.blankAllVals();

    };

    // method to pass touch coords to the wizzHandler
    const touchWizz = (e, clock) => {
        wizzHandler(e, clock, e.touches[0].clientX, e.touches[0].clientY, clock.touchBuff);
    };

    // for dealing with the first mouse instance
    const mouseInit = (e, clock) => {

        // remove the very clock listener from the obj
        clock.obj.removeEventListener('mousedown', clock.mouseInit);

        // add the mouse version of the wizzHandler
        window.addEventListener('pointermove', clock.mouseWizz, { passive: false });

        // add the mouse stop listener
        window.addEventListener('mouseup', clock.mouseEnd);

    };

    // what to do when the mouse goes up
    const mouseEnd = (e, clock) => {

        // remove clock listener
        window.removeEventListener('mouseup', clock.mouseEnd);

        // remove the mouse move handler
        window.removeEventListener('pointermove', clock.mouseWizz);

        // add the mouse init listener back
        clock.obj.addEventListener('mousedown', clock.mouseInit);

        // reset everything to zero
        clock.mouseBuff.blankAllVals();

    };

    // method to pass mouse coords to the wizzHandler
    const mouseWizz = (e, clock) => {
        wizzHandler(e, clock, e.clientX, e.clientY, clock.mouseBuff);
    };
    
    // }

    // the object for each wizzer on the page {
    const Wizzer = function(obj) {

        // the prefs holder for this specific wizzer
        this.prefs = {};

        // get any prefs set in individual tag data-wizz param
        let dataPrefs = JSON.parse(obj.dataset.wizz || '{}');

        // if any valid prefs were given, set them
        for (let p in defPrefs) {
            this.prefs[p] = dataPrefs[p] !== undefined ? dataPrefs[p] : defPrefs[p];
        }

        this.obj = obj;

        // the default threshold angles in degrees
        this.threshold = { min: 2, max: 90 };

        // create both mouse and touch buffers
        this.touchBuff = new WizzBuffer(this.prefs.touchEventName);
        this.mouseBuff = new WizzBuffer(this.prefs.mouseEventName);

        // blank the buffers on start
        this.touchBuff.blankAllVals();
        this.mouseBuff.blankAllVals();

        this.touchWizz = e => touchWizz(e, this);
        this.touchInit = e => touchInit(e, this);
        this.touchEnd = e => touchEnd(e, this);
        this.mouseWizz = e => mouseWizz(e, this);
        this.mouseInit = e => mouseInit(e, this);
        this.mouseEnd = e => mouseEnd(e, this);

        this.obj.addEventListener('touchstart', this.touchInit);
        this.obj.addEventListener('mousedown', this.mouseInit);

    };
    //}

    // win.load init {
    window.addEventListener('load', e => {
    
        // loop through all data-param-specified objects
        document.querySelectorAll(
            `[data-${defPrefs.selector}]:not(script)`
        ).forEach(obj => {
    
            new Wizzer(obj);
    
        });

    });
    //}

})();
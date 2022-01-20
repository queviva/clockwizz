//////////////////////////////////////////////////
// queviva - MCMLXXXVIII                        /{
//
// clock|anti-clock|wizz-motion detector
/////////////////////////////////////////////////}

// expiration check {
//new Date() < new Date('2023-10-13') &&
//}

((
    // preserve the dataset for when content loads
    dset = document.currentScript.dataset

// do not run anything until content loaded
) => document.addEventListener('DOMContentLoaded', e => (function() {

    // useful constants {
    const pi80 = 180 / Math.PI;
    //}
    
    // prefs for wizz objs {
    const default_prefs = {
        selector        : 'wizz',
        eventName       : 'clockwizz',
        direction       : 'dir',
        magnitude       : 'mag',
        eventRef        : 'evt',
        buffSize        : 5,
        min             : 2,
        max             : 90,
        preventDefault  : true
    };
    
    // prefs set in script tag data-param
    const param_prefs = JSON.parse(Object.values(dset)[0] || '{}');
    
    // over-rite default prefs with script tag data-params
    const prefs = Object.assign({}, default_prefs, param_prefs);
    
    //}

    // an object for holding buffer values {
    const WizzBuffer = function() {
        
        'coords|atans|deltas'.split('|').forEach((v,i) => {
            this[v] = new Array(prefs.buffSize + 1 - i);
        });
        
    };

    // method to blank all values in a buffer
    WizzBuffer.prototype.blankAllVals = function() {
    
        // coords can NOT be chained - must fill then map
        this.coords.fill(0);
        this.coords = this.coords.map(v => ({ x: 0, y: 0 }));
        this.atans.fill(0);
        this.deltas.fill(0);
    
    };
    //}

    // all the lizzers {
    const lizz = {
    
        // method for calculating the wizz
        wizzHandler: (e, wizz, xVal, yVal, buff = wizz.buff) => {
            
            // chop the first coord off
            buff.coords.shift();
    
            // put the new coord on the end
            buff.coords.push({ x: xVal, y: yVal });
    
            // calc the atans
            for (let i = 1, j = buff.coords.length; i < j; i++) {
    
                // get the angle between ...
                buff.atans[i - 1] = (Math.atan2(
    
                    // every other coord
                    // and the first coord in the list
                    buff.coords[i].y - buff.coords[0].y,
                    buff.coords[i].x - buff.coords[0].x
    
                    // convert to degrees
                ) * pi80);
    
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
    
            // get magnitudes of all deltas {
            let absDeltas = buff.deltas.map((v, i) =>
    
                // zero out all the extremes
                Math.abs(v) > wizz.prefs.max ||
                Math.abs(v) < wizz.prefs.min ?
                0.000069 : Math.abs(v)
    
            );
            //}
    
            // get the maxDelta
            let maxDelta = Math.max(...absDeltas);
    
            // get the sign of the final delta
            let sgnFinalDelta = Math.sign(buff.deltas[buff.deltas.length - 1]);
    
            // default the direction to no-turn
            let dir = 0;
    
            // then, if ... {
            if (
    
                // the final delta is not zero ...
                sgnFinalDelta !== 0
    
                // and ...
                &&
    
                // all the deltas ...
                buff.deltas.every(v =>
    
                    // have the same sign as the final ...
                    Math.sign(v) === sgnFinalDelta
    
                )
    
                // and ...
                &&
    
                // none of the absDeltas is zero ...
                absDeltas.every(v => v !== 0)
    
                // and ...
                &&
    
                // all of the absDeltas exceeds the min ...
                absDeltas.every(v => v > wizz.prefs.min)
    
                // and ...
                &&
    
                // none of the absDeltas exceeds the max ...
                absDeltas.every(v => v < wizz.prefs.max)
    
            ) {
    
                // then set the dir to that sign
                dir = sgnFinalDelta;
    
            }
            // }
    
            // dispatch the wizz event
            wizz.obj.dispatchEvent(new CustomEvent(wizz.prefs.eventName, {
                detail: {
                    [prefs.direction] : dir,
                    [prefs.magnitude] : Math.max(
                        Math.abs(
                            buff.coords[0].x - buff.coords[buff.coords.length - 1].x
                        ),
                        Math.abs(
                            buff.coords[0].y - buff.coords[buff.coords.length - 1].y
                        )
                    ),
                    [prefs.eventRef] : e
                }
            }));
    
            if (wizz.prefs.preventDefault) {
                e.preventDefault();
                e.stopPropagation();
            }
    
        },
    
        // touch initializer
        touchInit: (e, wizz) => {
    
            // remove this very listener
            wizz.obj.removeEventListener('touchstart', wizz.touchInit);
    
            // add the touch version of the wizzHandler
            wizz.obj.addEventListener('touchmove', wizz.touchWizz, { passive: false });
    
            // add the touch stop listener
            wizz.obj.addEventListener('touchend', wizz.touchEnd);
    
        },
    
        // remover|resetter on touch end
        touchEnd: (e, wizz) => {
    
            // remove this very listener
            wizz.obj.removeEventListener('touchend', wizz.touchEnd);
    
            // remove the touch move handler
            wizz.obj.removeEventListener('touchmove', wizz.touchWizz);
    
            // re-add the touch initialization listener
            wizz.obj.addEventListener('touchstart', wizz.touchInit);
    
            // reset everything to zero
            wizz.buff.blankAllVals();
    
        },
    
        // method to pass touch coords to the wizzHandler
        touchWizz: (e, wizz) => {
            lizz.wizzHandler(e, wizz, e.touches[0].clientX, e.touches[0].clientY);
        },
    
        // for dealing with the first mouse instance
        mouseInit: (e, wizz) => {
    
            // remove this very listener
            wizz.obj.removeEventListener('mousedown', wizz.mouseInit);
    
            // add the mouse version of the wizzHandler
            window.addEventListener('mousemove', wizz.mouseWizz, { passive: false });
    
            // add the mouse stop listener
            window.addEventListener('mouseup', wizz.mouseEnd);
    
        },
    
        // what to do when the mouse goes up
        mouseEnd: (e, wizz) => {
    
            // remove this very listener
            window.removeEventListener('mouseup', wizz.mouseEnd);
    
            // remove the mouse move handler
            window.removeEventListener('mousemove', wizz.mouseWizz);
    
            // add the mouse init listener back
            wizz.obj.addEventListener('mousedown', wizz.mouseInit);
    
            // reset everything to zero
            wizz.buff.blankAllVals();
    
        },
    
        // method to pass mouse coords to the wizzHandler
        mouseWizz: (e, wizz) => {
            lizz.wizzHandler(e, wizz, e.clientX, e.clientY);
        }
    
    };
    //}

    // loop through all data-selector objects {
    document.querySelectorAll(
            
        // that are NOT a script tag
        `[data-${prefs.selector}]:not(script)`
            
    // make each one a wizzer object ['weird new' is necessary]
    ).forEach(obj => new (function() {
    
        
            // the prefs holder for this specific wizzer
            this.prefs = Object.assign({}, prefs,
                JSON.parse(obj.dataset[prefs.selector] || '{}')
            );
        
            // remember the html element
            this.obj = obj;
        
            // create a buffer object
            this.buff = new WizzBuffer();
        
            // blank the buffer on start
            this.buff.blankAllVals();
        
            // it's the same idiocy as making var with .bind(this)
            `touch mouse`.split(' ')
            .forEach(t => `Wizz Init End`.split(' ')
            .forEach(l => (this[t + l] = e => lizz[t + l](e, this))));
        
            // begin listening for both types
            this.obj.addEventListener('touchstart', this.touchInit);
            this.obj.addEventListener('mousedown', this.mouseInit);
        
        })()
            
    );
    //}

})()))()

// expiration message {
//=== undefined || (console.log('eXp!red'));
//}
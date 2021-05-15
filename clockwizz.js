//////////////////////////////////////////////////
// queviva - clock|anti-clock|wizz-motion detector
//
//  = send -1 0 1  based on clockmove
//  = send magnitude
//
//////////////////////////////////////////////////

// pass currentScript into async|defer script [new is necessary]

new (function(dset) {
    
    // useful constants {
    const pi80 = 180 / Math.PI;
    //}

    // default prefs for all wizzer objs themselves {
    const default_prefs = {
        selector: 'wizz',
        mouseEventName: 'mousewizz',
        touchEventName: 'touchwizz',
        buffSize: 5,
        min: 2,
        max: 90,
        preventDefault: true
    };
    //}

    // prefs set in data- param {
    const param_prefs = JSON.parse(Object.values(dset)[0] || '{}');
    //}

    // over-rite default prefs with script's data- params {
    const prefs = Object.assign({}, default_prefs, param_prefs);
    //}

    // an object for holding buffer values {
    const WizzBuffer = function(eventName) {
        
        'coords|atans|deltas'.split('|').forEach((v,i) => {
            this[v] = new Array(prefs.buffSize + 1 - i);
        });
        
        this.eventName = eventName;
    };
    //}

    // method to blank all values in a buffer {
    WizzBuffer.prototype.blankAllVals = function() {
    
        this.coords.fill(0).map(v => ({ x: 0, y: 0 }));
        this.atans.fill(0);
        this.deltas.fill(0);
    
    };
    //}

    // all the lizzers {
    const lizz = {
    
        // method for calculating the wizz
        wizzHandler: (e, wizz, xVal, yVal, buff) => {
            
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
            wizz.obj.dispatchEvent(new CustomEvent(buff.eventName, {
                detail: {
                    event: e,
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
    
            if (wizz.prefs.preventDefault) {
                e.preventDefault();
                e.stopPropagation();
            }
    
        },
    
        // touch initializer
        touchInit: (e, wizz) => {
    
            // remove the very listener
            wizz.obj.removeEventListener('touchstart', wizz.touchInit);
    
            // add the touch version of the wizzHandler
            wizz.obj.addEventListener('touchmove', wizz.touchWizz, { passive: false });
    
            // add the touch stop listener
            wizz.obj.addEventListener('touchend', wizz.touchEnd);
    
        },
    
        // remover|resetter on touch end
        touchEnd: (e, wizz) => {
    
            // remove the very listener
            wizz.obj.removeEventListener('touchend', wizz.touchEnd);
    
            // remove the touch move handler
            wizz.obj.removeEventListener('touchmove', wizz.touchWizz);
    
            // re-add the touch initialization listener
            wizz.obj.addEventListener('touchstart', wizz.touchInit);
    
            // reset everything to zero
            wizz.touchBuff.blankAllVals();
    
        },
    
        // method to pass touch coords to the wizzHandler
        touchWizz: (e, wizz) => {
            lizz.wizzHandler(e, wizz, e.touches[0].clientX, e.touches[0].clientY, wizz.touchBuff);
        },
    
        // for dealing with the first mouse instance
        mouseInit: (e, wizz) => {
    
            // remove the very wizz listener from the obj
            wizz.obj.removeEventListener('mousedown', wizz.mouseInit);
    
            // add the mouse version of the wizzHandler
            window.addEventListener('mousemove', wizz.mouseWizz, { passive: false });
    
            // add the mouse stop listener
            window.addEventListener('mouseup', wizz.mouseEnd);
    
        },
    
        // what to do when the mouse goes up
        mouseEnd: (e, wizz) => {
    
            // remove wizz listener
            window.removeEventListener('mouseup', wizz.mouseEnd);
    
            // remove the mouse move handler
            window.removeEventListener('mousemove', wizz.mouseWizz);
    
            // add the mouse init listener back
            wizz.obj.addEventListener('mousedown', wizz.mouseInit);
    
            // reset everything to zero
            wizz.mouseBuff.blankAllVals();
    
        },
    
        // method to pass mouse coords to the wizzHandler
        mouseWizz: (e, wizz) => {
            lizz.wizzHandler(e, wizz, e.clientX, e.clientY, wizz.mouseBuff);
        }
    
    }
    //}

    // loop through all data-selector objects {
    document.querySelectorAll(
            
        // that are NOT a script tag
        `[data-${prefs.selector}]:not(script)`
            
    ).forEach((obj, i) => {
    
        // make each one a wizzer
        this[i] = new (function(obj) {
        
            // the prefs holder for this specific wizzer
            this.prefs = Object.assign({}, prefs,
                JSON.parse(obj.dataset[prefs.selector] || '{}')
            );
        
            // remember the html element
            this.obj = obj;
        
            // create both mouse and touch buffers
            this.touchBuff = new WizzBuffer(this.prefs.touchEventName);
            this.mouseBuff = new WizzBuffer(this.prefs.mouseEventName);
        
            // blank the buffers on start
            this.touchBuff.blankAllVals();
            this.mouseBuff.blankAllVals();
        
            // it's the same idiocy as making var with .bind(this)
            `touch mouse`.split(' ')
            .forEach(t => `Wizz Init End`.split(' ')
            .forEach(l => (this[t + l] = e => lizz[t + l](e, this))));
        
            // begin listening for both types
            this.obj.addEventListener('touchstart', this.touchInit);
            this.obj.addEventListener('mousedown', this.mouseInit);
        
        })(obj);
            
    });
    //}

})(document.currentScript.dataset);
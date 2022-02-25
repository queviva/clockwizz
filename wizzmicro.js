(( // anonymouse closure

    X='wizz', // the prefi_X_
    
    O=Object, // shorthand for _O_bjects
    
    M=Math,   // shorthand for _M_ath

    B=M.abs   // shortfor a_B_solute-value
    
    // loop through every wizz element...
)=>document.querySelectorAll(
    
    // that has a data-wizz parameter
    `[data-${X}]`
    
).forEach((
    
    W, // each _W_izzer object
    
    I, // a builtin _I_ndex
    
    N, // a builtin _N_odelist
    
    // the _C_oordinates filled with zero
    C=Array.from({length:6},c=>({x:0,y:0})),
    
    // the ca_L_culator
    L=(
        e, // _e_vent to pass through
        g  // event for getting pa_g_e.xy
    )=>{
        
        // remove old coord
        C.shift(),
        
        // add new coord
        C.push({x:g.pageX,y:g.pageY});
       
        // _m_agnitude is the bigger of..
        let m=M.max(
            // the deltaX, and ...
            B(C[0].x-C.at(-1).x),
            //the deltaY
            B(C[0].y-C.at(-1).y)
        ),
        
        // the _a_rea of the polygon is ...
        a=
        
        // the sum
        C.reduce((
            
            p, // _p_revious value
            c, // _c_urrent coordinate
            i, // _i_ndex
            _, // _ignore
            j=C[(i+1)%6] // next _j_ndex
            
        )=>p+ //increment previous by ...
        
            // sum of the x's
            (j.x + c.x)
            
            // times
            *
            
            // the diff of the y's
            (j.y - c.y),
            
            // begining area at zero
            0
            
        );
        
        // dispatch the clock-wizz event
        W.dispatchEvent(new CustomEvent('clock-'+X, {detail:{
            
            // direction ...
            dir:
                // area/circle more than 20%
                B(a)/(0.785*m*m)>0.2
                
                // magnitude more than 5
                &&m>5
                
                // not every coord is zeroed
                &&C.every(c=>c.x!==0)
                
                ?
                // then dir is sign of area ...
                M.sign(a)
                
                // else, no turning
                :0,
                
            // send magnitude
            mag:m,
            
            // include reference to event
            ref:e}
            
        }));
        
    },
    
    // the li_ZZ_ners
    Z={mouse:e=>L(e,e),touch:e=>L(e,e.touches[0])},
    
    // _A_ctivation method
    A=
    
        v=> // boolean _v_alue
    
    {
        
        // blank all coords
        C=C.map(c=>({x:0,y:0}));
        
        // loop through lizzners
        for(let z in Z){
            
            // add-or-remove each lizzner
            window[(v?'add':'remove')+'EventListener'](
                z+'move',Z[z],{passive:false}
            )
        }
    }
    
// add the able-wizz lizzner and call _A_ble()
)=>W.addEventListener('able-'+X,e=>A(e.detail))))

// invoke yourself
();
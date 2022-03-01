((
    X='wizz', // the prefi_X_
    O=Object, // short for _O_ject
    M=Math,   // short for _M_ath
    B=M.abs   // short for a_B_solute

// query selector is its own closure
)=>document.querySelectorAll(`[data-${X}]`).forEach((
    
    W, // the _W_izzer obj itself
    I, // builtin _I_ncrement
    N, // builtin _N_odelist
    
    // buffer of _C_oordinates
    C=Array.from({length:6},c=>({x:0,y:0})),
    
    // the computation _L_izzner
    L=(
        e, // _e_vent object
        g, // pa_g_e.x|y object
        m, // _m_agnitude var
        
        // _a_rea, false init'ed to buffer update
        a=C.shift()+C.push({x:g.pageX,y:g.pageY})
        
        
        // dispatch the clock-wizz event
    )=>W.dispatchEvent(new CustomEvent('clock-'+X,{detail:{
            
        // mag is just diff of first and last coords
        mag:m=M.max(B(C[0].x-C[5].x),B(C[0].y-C[5].y)),
            
        // direction is the sign of the polygon area ...
        dir:B(a=C.reduce((p,c,i,_,j=C[(i+1)%6])=>
            p+(j.x+c.x)*(j.y-c.y),0)
            
        // if beyond a threshold, else 0
        )/m/m>.2&&m>5&&C.every(c=>!!c.x)?M.sign(a):0,
            
        // include a reference to the actual event
        ref:e
        
    }})),
    
    // window li_ZZ_ners just call the computator
    Z={mouse:e=>L(e,e),touch:e=>L(e,e.touches[0])},
    
    // method to _A_ctivate the wizzer
    A=v=>{for(let z in Z){
        
        // zero out the buffer
        C=C.map(c=>({x:0,y:0}));
        
        // add|remove the lizzners
        window[(v?'add':'remove')+'EventListener']
        (z+'move',Z[z],{passive:0});
    }}
    
// all wizzers just listen for activation calls
)=>W.addEventListener('able-'+X,e=>A(e.detail))))()
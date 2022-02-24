((D)=>document.addEventListener('DOMContentLoaded',(E,

    O=Object,
    
    P=Object.assign({
        selector        : 'wizz',
        preventDefault  :  true
    },
    JSON.parse(Object.values(D)[0]||'{}')),
    
    R=P.selector,
    
    T='touches',
    
    M=Math,
    
    B=M.abs
    
)=>document.querySelectorAll(`[data-${R}]:not(script)`).forEach((
    
    W,I,N,
    
    F=Object.assign({},P,JSON.parse(W.dataset[R]||'{}')),
    
    C=Array.from({length:6},c=>({x:0,y:0})),
    
    L=(e,g)=>{
    
        C.shift(), C.push({x:g.pageX,y:g.pageY});
    
        let m=M.max(
            B(C[0].x-C.at(-1).x),
            B(C[0].y-C.at(-1).y)
        ),
        
        a=C.reduce((p,c,i)=>p+
            (C[(i+1)%6].x + c.x) *
            (C[(i+1)%6].y - c.y),0
        ),
        
        d=B(a)/(0.785*m*m)>0.2 // % roundness
        
        &&m>5 // minimum radius
        
        &&C.every(c=>c.x!==0) // prevent jumps
        
        ?M.sign(a):0;
        
        W.dispatchEvent(new CustomEvent('clock-'+R, {
            detail:{dir:d,mag:m,ref:e}
        }));
        
        F.preventDefault&&(
        e.preventDefault(),
        e.stopPropagation());
        
    },

    Z={
        mouse:e=>L(e,e),
        touch:e=>L(e,e[T][0])
    }
    
)=>Object.keys(Z).forEach((
    z,i,p,a=[z+'move',Z[z],{passive:false}]
)=>W.addEventListener(
    
    z+['down','start'][i],
    
    ()=>[a, [z+['up','end'][i],()=>(
        console.log('up '+ W.id),
        C=C.map(c=>({x:0,y:0})),
        window.removeEventListener(...a)),
        {once:true}]
    ].forEach(e=>window.addEventListener(...e))
        
)))))(document.currentScript.dataset);
((D)=>document.addEventListener('DOMContentLoaded',(e,

    O=Object,
    
    P=Object.assign({
        
        selector        : 'wizz',
        preventDefault  : true
        
    },JSON.parse(Object.values(D)[0]||'{}')),
    
    R=P.selector,
    
    T='touches',
    
    M=Math,
    
    B=M.abs,
    
    PI80=180/M.PI
    
) => document.querySelectorAll(`[data-${R}]:not(script)`

).forEach((
    
    N,V,J,
    
    F=Object.assign({},P,JSON.parse(N.dataset[R]||'{}')),
    
    C=new Array(6).fill(0).map(k=>({x:0,y:0})),
    
    W=(e,m)=>{
    
        C.shift();
    
        C.push({ x: m.pageX, y: m.pageY });
    
        let mag = M.max(
            M.abs(C[0].x-C.at(-1).x),
            M.abs(C[0].y-C.at(-1).y)
        );
        
        let area = C.reduce((p, c, i) => p +
                (C[(i + 1) % 6].x + c.x) *
                (C[(i + 1) % 6].y - c.y), 0
        );
        
        let dir =
        
            B(area)/(0.785 * mag * mag) > 0.2 && mag > 5
        
            ? M.sign(area) : 0;
        
        N.dispatchEvent(new CustomEvent('clock-'+R, {
            detail:{dir:dir,mag:mag,ref:e}
        }));

        if(F.preventDefault){
            e.preventDefault();
            e.stopPropagation();
        }
        
    },

    Z={
        mousemove:e=>W(e,e),
        touchmove:e=>W(e,e[T][0])
    }

)=>[N,window].forEach((J,j)=>
    
    Object.keys(Z).forEach((z,i)=>J.addEventListener(
        [['mousedown','touchstart'],
        ['mouseup','touchend']][j][i],
        e=>window[(j===0?'add':'remove')+'EventListener']
        (z,Z[z],{passive:false})
    )))

)))(document.currentScript.dataset);
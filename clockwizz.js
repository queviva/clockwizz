(D=>document.addEventListener('DOMContentLoaded',(

    E,O=Object,J=JSON.parse,M=Math,B=M.abs,

    T='touches',
    
    P=O.assign({

        selector        : 'wizz',
        minimum         : 5,
        preventDefault  : true

    },J(O.values(D)[0]||'{}')),

    X=P.selector

)=>document.querySelectorAll(`[data-${X}]:not(script)`).forEach((

    W,I,N,

    F=O.assign({},P,J(W.dataset[X]||'{}')),
    
    C=Array.from({length:6},c=>({x:0,y:0})),

    Z={mouse:e=>L(e,e),touch:e=>L(e,e[T][0])},

    L=(e,g,m,a=C.shift()+C.push({x:g.pageX,y:g.pageY}))=>
    W.dispatchEvent(new CustomEvent('clock-'+F.selector,{
        detail:{

            ref:F.preventDefault&&(
                e.preventDefault(),
                e.stopPropagation())||e,

            mag:m=M.max(
                B(C[0].x-C[5].x),
                B(C[0].y-C[5].y)
            ),

            dir:m>F.minimum&&C.every(c=>!!c.x)&&

                B(a=C.reduce((p,c,i,_,j=(i+1)%6)=>p+
                    (C[j].x+c.x)*(C[j].y-c.y),0
                ))/m/m>0.18?M.sign(a):0

        }
    }))

)=>O.keys(Z).forEach((

    z,i,p,a=[z+'move',Z[z],{passive:false}]

)=>W.addEventListener(

    z+['down','start'][i],

    ()=>[a,[z+['up','end'][i],()=>(

        C=C.map(c=>({x:0,y:0})),

        window.removeEventListener(...a)),

        {once:true}]

    ].forEach(p=>window.addEventListener(...p))

))

)))(document.currentScript.dataset)

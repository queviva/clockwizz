((
    X='wizz',
 
    O=Object,

    M=Math,

    B=M.abs

)=>document.querySelectorAll(`[data-${X}]`).forEach((

    W,I,N,

    C=Array.from({length:6},c=>({x:0,y:0})),
    
    Z={mouse:e=>L(e,e),touch:e=>L(e,e.touches[0])},

    L=(e,g)=>{

        C.shift(), C.push({x:g.pageX,y:g.pageY});

        let m=M.max(
            B(C[0].x-C.at(-1).x),
            B(C[0].y-C.at(-1).y)
        ),

        a=C.reduce((p,c,i,_,j=C[(i+1)%6])=>p+
            (j.x+c.x) *
            (j.y-c.y),0
        );

        W.dispatchEvent(new CustomEvent('clock-'+X,{detail:{
            ref:e,
            mag:m,
            dir:
                B(a)/0.785/m/m>0.2
                &&m>5
                &&C.every(c=>c.x!==0)
                ?M.sign(a):0
        }}));

    },

    A=v=>{for(let z in Z){
        C=C.map(c=>({x:0,y:0}));
        window[(v?'add':'remove')+'EventListener']
        (z+'move',Z[z],{passive:false})
    }}

)=>W.addEventListener('able-'+X,e=>A(e.detail))))();
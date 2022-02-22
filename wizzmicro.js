((
    
    D=document.currentScript.dataset
    
) => document.addEventListener('DOMContentLoaded', (e,

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
    
    [C,A,D]='123'.split('').map((v,i)=>
        new Array(6-i).fill(0).map(k=>i>0?k:{x:0,y:0})
    ),
    
    W=(e,m)=>{
        
        C.shift();

        C.push({x:m.pageX,y:m.pageY});
        
        /*
        let dir = Math.sign(C.reduce((p,c,i) => p+
           (C[(i+1)%6].x - c.x)*
           (C[(i+1)%6].y + c.y),0
        ));
        */
        
        A = A.map((a,i) =>
            Math.atan2(
               C[i+1].y - C[0].y,
               C[i+1].x - C[0].x
            ) * PI80
        );
        
        D = D.map((d,i) => {
            let tmp = A[i + 1] - A[i]
            return tmp > 180 ? tmp - 360 : tmp < -180 ? tmp + 360 : tmp;
        });
        
        let absD = D.map(d=>
            Math.abs(d) > 90 ||
            Math.abs(d) <  2 ?
            0.000069 : Math.abs(d)
        );
        
        let sig = M.sign(D.at(-1));
        
        let dir = 0;
        
        if (
            sig !== 0 &&
            D.every(d=>M.sign(d) === sig) &&
            absD.every(a=>
                a !==0 &&
                a < 90 &&
                a >  2
            )
        ) {
            dir = sig;
        }
        
        N.dispatchEvent(new CustomEvent('clock-'+R, {
            detail: {
                dir: dir,
                mag: M.max(
                  M.abs(C[0].x-C.at(-1).x),
                  M.abs(C[0].y-C.at(-1).y)
                ),
                ref: e
            }
        }));

        if(F.preventDefault){
            e.preventDefault();
            e.stopPropagation();
        }
        
    },
    
    xxW=(e,m)=>{

        C.shift();

        C.push({x:m.pageX,y:m.pageY});

        C.forEach((c,i)=>{
            
            A[i - 1] = (M.atan2(

                c.y - C[0].y,
                c.x - C[0].x

            ) * PI80);
            
        });
        
        A.forEach((a,i)=>{

            let tmp = a - A[i - 1];

            tmp =
                tmp >  180 ? tmp - 360 :
                tmp < -180 ? tmp + 360 :
                tmp;

            D[i - 1] = tmp;

        })

        let absDeltas = D.map((v, i) =>

            M.abs(v) > 90 ||
            M.abs(v) < 2 ?
            69e-9 : M.abs(v)

        );
        
        let signFinalDelta = M.sign(D.at(-1));

        let dir = 0;

        if (

            signFinalDelta !== 0

            &&

            D.every(v =>

                M.sign(v) === signFinalDelta

            )

            &&

            absDeltas.every(v => v > 2)

        ) {

            dir = signFinalDelta;

        }

        N.dispatchEvent(new CustomEvent('clock-'+R, {
            detail: {
                dir: dir,
                mag: M.max(
                  M.abs(C[0].x-C.at(-1).x),
                  M.abs(C[0].y-C.at(-1).y)
                ),
                ref: e
            }
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

)))();
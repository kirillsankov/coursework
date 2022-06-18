
function irand(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
let _NBALLS = 50;
balls = [];
walls = [];
function Vect(x, y) {
    this.x = x; this.y = y;
}
function vminus(v1, v2) {
    return new Vect(v1.x-v2.x, v1.y-v2.y);
}
function normalize(v) {
    let L = Math.sqrt(v.x*v.x + v.y*v.y);
    if ( L > 0 ) {
        v.x = v.x / L;
        v.y = v.y / L;
    }
    return v;
}

function collision ( A, B ) {
    let pA = new Vect(A.x+A.vx, A.y+A.vy);
    let pB = new Vect(B.x+B.vx, B.y+B.vy);
    let dx=pA.x-pB.x, dy=pA.y-pB.y, dr=A.r+B.r;
    return dx*dx+dy*dy < dr*dr;
}
function collide ( A, B ) {
    let u = new Vect(A.x-B.x, A.y-B.y);
    u = normalize(u);
    let v = new Vect(-u.y, u.x);
    u1 = A.vx*u.x + A.vy*u.y;
    u2 = B.vx*u.x + B.vy*u.y;
    v1 = A.vx*v.x + A.vy*v.y;
    v2 = B.vx*v.x + B.vy*v.y;
    uG = (A.m*u1 + B.m*u2)/(A.m + B.m);
    u1 = 2*uG - u1;
    u2 = 2*uG - u2;
    A.vx = u.x*u1 + v.x*v1;
    A.vy = u.y*u1 + v.y*v1;
    B.vx = u.x*u2 + v.x*v2;
    B.vy = u.y*u2 + v.y*v2;
}
function collisionWall ( B, W ) {
    let pos = new Vect(B.x+B.vx, B.y+B.vy);
    let dist = Math.abs(W.a*pos.x+W.b*pos.y+W.c)/W.a2b2;
    return dist < B.r;
}
function collideWall ( B, W ) {
    let v = W.v, u = W.u;
    let u1 = - (B.vx*u.x + B.vy*u.y);
    let v1 = B.vx*v.x + B.vy*v.y;
    B.vx = u.x*u1 + v.x*v1;
    B.vy = u.y*u1 + v.y*v1;
}
function Ball( r ) {
    this.r = r;
    this.m = this.r*this.r;
    this.initv = function( t ) {
        this.vx = Math.random()*t - t/2;
        this.vy = Math.random()*t - t/2;
    }
    this.initv ( 0 );
    while(1) {
        this.x = irand(10, C.width-10);
        this.y = irand(10, C.height-10);
        let ok = 1;
        for(let i=0;i<balls.length;i++)
            if( collision(this,balls[i]) ) {
                ok = 0;
                break;
            }
        if ( ok ) break;
    }
    this.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI, false);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#000000";
        ctx.stroke();
    }
    this.go = function() {
        this.x += this.vx;
        this.y += this.vy;
    }
}
function Wall(x1, y1, x2, y2) {
    this.a = y2 - y1;
    this.b = x1 - x2;
    this.c = y1*x2 - x1*y2;
    this.p1 = new Vect(x1,y1);
    this.p2 = new Vect(x2,y2);
    this.dv = vminus(this.p2, this.p1);
    this.v = normalize(this.dv);
    this.nv = Math.sqrt(this.dv.x*this.dv.x + this.dv.y*this.dv.y);
    this.u = new Vect(this.v.y, -this.v.x);
    this.a2b2 = Math.sqrt(this.a*this.a+this.b*this.b);
    this.draw = function() {
        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#000000";
        ctx.stroke();
    }
}
function init() {
    C = document.getElementById("field");
    ctx = C.getContext('2d');
    walls.push( new Wall(0, 0, 0, C.height) );
    walls.push( new Wall(0, 0, C.width, 0) );
    walls.push( new Wall(0, C.height, C.width, C.height) );
    walls.push( new Wall(C.width, 1, C.width, C.height) );
    balls.push(new Ball(25))
    for(let i=1;i<_NBALLS;i++)
        balls.push(new Ball(5))
    ctx.fillStyle="#ccc";
    ctx.fillRect(0, 0, C.width, C.height);
    for(let i=0;i<walls.length;i++)
        walls[i].draw()
}
function refresh() {
    ctx.fillStyle="#ffffff";
    ctx.fillRect(0, 0, C.width, C.height);
    while ( 1 ) {
        done = 1;
        for(let i=0;i<balls.length-1;i++)
            for(let j=i+1;j<balls.length;j++)
                if ( collision(balls[i], balls[j]) ) {
                    collide( balls[i], balls[j] );
                    if ( ! collision(balls[i], balls[j]) )
                        done = 0;
                }
        if ( done ) break;
    }
    for(let i=0;i<balls.length;i++)
        for(let j=0;j<walls.length;j++)
            if ( collisionWall(balls[i], walls[j]) )
                collideWall( balls[i], walls[j] );
    for(let i=1;i<balls.length;i++)
        balls[i].draw()
    for(let i=0;i<walls.length;i++)
        walls[i].draw()
    for(let i=0;i<balls.length;i++)
        balls[i].go()
    let t = new Date() - tStart;
    if ( t >= 30000 ) {
        t = "30:00";
        endSimulation();
    }
    else {
        sec = Math.floor(t/1000);
        dec = Math.floor((t-1000*sec)/100);
        if ( sec < 10 ) sec = '0' + sec;
        t = sec + ':' + dec;
    }
    document.getElementById('time').innerHTML = 'Время моделирования: ' + t + ' сек.';
}
simulationOn = 0;
function startSimulation() {
    if ( simulationOn ) {
        endSimulation();
        return;
    }
    let tC = 0;
    tRange = 4*Math.sqrt((273+tC)/293);
    for(let i=0;i<balls.length;i++) {
        balls[i].initv ( tRange );
    }
    balls[0].x = C.width / 2;
    balls[0].y = C.height / 2;
    balls[0].vx = 0;
    balls[0].vy = 0;
    for(let i=1;i<balls.length;i++)
        if( collision(balls[i], balls[0]) )
            while(1) {
                balls[i].x = irand(10, C.width-10);
                balls[i].y = irand(10, C.height-10);
                let ok = 1;
                for(let j=0;j<balls.length;j++)
                    if( i != j  &&  collision(balls[i],balls[j]) ) {
                        ok = 0;
                        break;
                    }
                if ( ok ) break;
            }
    tStart = new Date();
    id = setInterval(refresh, 1000 / 100);
    document.getElementById('startbtn').src = './img/btn-on.png';
    simulationOn = 1;
}
function endSimulation() {
    simulationOn = 0;
    clearInterval(id);
    document.getElementById('startbtn').src = './img/btn-off.png';
}
init();
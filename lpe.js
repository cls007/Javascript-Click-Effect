var canvas;
var ctx;
//配置粒子行为
//不需要使用随机量时参考加速度的配置
var conf = {
    position: "emitter",
    //速度
    velocity: {   
        enableRandom: true,     //随机生成
        upperBoundary: 2,      //随机生成上界
        LowerBoundary: -2,      //下界
    }, 
    //加速度
    acceleration: {   
        x : 0,
        y : 0.005,
    }, 
    //大小
    size: {
        enableRandom: true,
        upperBoundary: 4,
        LowerBoundary: 1,
    }, 
    //颜色
    color: {
        enableRandom: true,
        upperBoundaryR: 255,
        LowerBoundaryR: 0,
        upperBoundaryG: 255,
        LowerBoundaryG: 0,
        upperBoundaryB: 255,
        LowerBoundaryB: 0,
    },
    //显示的时间, 时间用完后就会消失
    lifetime:{
        enableRandom: true,
        upperBoundary: 30,
        LowerBoundary: 10,
    }
};
var em1;

function Vec2d(x, y)
{
    this.x = x || 0;
    this.y = y || 0;
}
//复制一个向量(比如复制一个速度)
function vecpy(vec)
{
    return new Vec2d(vec.x, vec.y);
}

function Particle(position, velocity, acceleration, color, size, lifetime)
{
    this.position = vecpy(position) || new Vec2d(0, 0);
    this.velocity = vecpy(velocity) || new Vec2d(0, 0);
    this.acceleration = vecpy(acceleration) || new Vec2d(0, 0);
    this.color = color || "rgb(0, 255, 0)";
    this.size = size || 1;
    this.lifetime = lifetime || 10;
}
//更新粒子状态
Particle.prototype.update = function(){
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;
    this.lifetime --;
};
//绘制粒子
Particle.prototype.draw = function(){
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.size, this.size);
};
//发射器
function Emitter(position, rate){
    this.position = vecpy(position);
    this.rate = rate || 1;
    this.particles = [];
    this.partConf = {};
}
Emitter.prototype.setPartConf = function(conf){
    this.partConf = conf;
};
//随机生成速度用的
Emitter.prototype.randomVec = function(obj){
    return new Vec2d(Math.random() * (obj.upperBoundary - obj.LowerBoundary) + obj.LowerBoundary,
                 Math.random() * (obj.upperBoundary - obj.LowerBoundary) + obj.LowerBoundary);
};
//随机生成颜色
Emitter.prototype.randomColor = function(obj){
    return "rgb(" + Math.random() * (obj.upperBoundaryR - obj.LowerBoundaryR) + obj.LowerBoundaryR
            + "," + Math.random() * (obj.upperBoundaryG - obj.LowerBoundaryG) + obj.LowerBoundaryG
            + "," + Math.random() * (obj.upperBoundaryB - obj.LowerBoundaryB) + obj.LowerBoundaryB
            + ")";
};
//在一个范围内的生成随机数, 用来支持上面的随机功能
Emitter.prototype.randomInRange = function(obj){
    return Math.random() * (obj.upperBoundary - obj.LowerBoundary) + obj.LowerBoundary;    
}
//根据配置来设置粒子的状态
Emitter.prototype.createParticle = function(){
    var position, velocity, acceleration, color, size, lifetime;
    if (this.partConf.position == "emitter"){
        position = vecpy(this.position);
    }else{
        position = vecpy(this.partConf.position);
    }
    if (this.partConf.velocity.enableRandom){
        velocity = this.randomVec(this.partConf.velocity);
    }else{
        velocity = new Vec2d(this.partConf.velocity.x,this.partConf.velocity.y);
    }
    if (this.partConf.acceleration.enableRandom){
        acceleration = this.randomVec(this.partConf.acceleration);
    }else{
        acceleration = new Vec2d(this.partConf.acceleration.x, this.partConf.acceleration.y);
    }
    if (this.partConf.size.enableRandom){
        size = this.randomInRange(this.partConf.size);
    }else{
        size = this.partConf.size.sideLength;
    }
    if (this.partConf.color.enableRandom){
        color = this.randomColor(this.partConf.color);
    }else{
        color = this.partConf.color.rgb;
    }
    if (this.partConf.lifetime.enableRandom){
        lifetime = this.randomInRange(this.partConf.lifetime);
    }else{
        lifetime = this.partConf.lifetime.time;
    }
    return new Particle(position, velocity, acceleration, color, size, lifetime);
};

Emitter.prototype.emit = function(){
    for (var i = 0; i < this.rate; i ++){
        this.particles.push(this.createParticle());
    }
};
//存活认证
function isalive(obj)
{
    if (obj.position.x > canvas.width || obj.position.y > canvas.height || 
    obj.position.x + obj.position.size < 0 || obj.position.y + obj.position.size < 0 ||
    obj.lifetime <= 0){
        return false;
    }
    return true;
}
//更新帧
function update()
{
    var alive = [];
    for (var j = 0; j < em1.particles.length; j ++){
        if (!isalive(em1.particles[j])){
            continue;
        }
        em1.particles[j].update();
        em1.particles[j].draw();
        alive.push(em1.particles[j]);
    }
    em1.particles = alive;
    return alive.length;
}
function loop()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (update() !== 0){
        window.requestAnimationFrame(loop);
    }else{
        if (canvas){
            document.body.removeChild(canvas);
            canvas = undefined;
        }
    }
}
em1 = new Emitter(new Vec2d(150, 150), 60);
function clickEventHandle(e)
{
    if (canvas){
        document.body.removeChild(canvas);
        canvas = undefined;
    }
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = 300;
    canvas.height = 300;
    canvas.style.backgroundColor = "rgb(0, 0, 0, 0)";
    canvas.style.position = "fixed";
    canvas.style.zIndex = 77777777;
    canvas.style.pointerEvents = "none";
    var eve = e || window.event;
    canvas.style.left = (eve.clientX - canvas.width / 2).toString() + "px";
    canvas.style.top = (eve.clientY - canvas.height / 2).toString() + "px";
    document.body.appendChild(canvas);
    em1.setPartConf(conf);
    em1.emit();
    loop();
}
document.addEventListener("click", clickEventHandle);

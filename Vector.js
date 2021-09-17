class Vector{
	constructor(x,y){
		if(y!=undefined){
			this.x = x + .0;
			this.y = y + .0;
		}
		else if(x!=undefined){
			let ang = random(0,TWO_PI);
			this.x = x*cos(ang);
			this.y = x*sin(ang);

		}
	}
	static randomVector(){
		return new Vector(random(-1,1),random(-1,1)).setMag(1);
	}
	static toRadians(ang){
		return ang * Math.PI / 180;
	}
	static toDegrees(ang){
		return ang * 180 / Math.PI;
	}
	copy(){
		return new Vector(this.x,this.y);
	}
	dist(v){
		return sqrt(pow(this.x-v.x,2)+pow(this.y-v.y,2));
	}
	getHeading(){
		if(this.y > 0)
			return acos(this.x);
		else
			return 180+acos(this.x);
	}
	getMag(){
		return sqrt(this.x*this.x+this.y*this.y)
	}
	setMag(mag){
		let oldMag = this.getMag();
		this.x *= mag/oldMag;
		this.y *= mag/oldMag;
		return this;
	}
	setHeading(ang){
		let mag = this.getMag();
		this.x = mag*cos(ang);
		this.y = mag*sin(ang);
	}
	rotate(ang){
		this.setHeading(ang+this.getHeading());
	}
	set(x,y){
		this.x = x;
		this.y = y;
	}
	pset(h,r){
		this.setHeading(h);
		this.setMag(r);
	}
	add(v){
		this.x += v.x;
		this.y += v.y;
		return this;
	}
	sub(v){
		this.x -= v.x;
		this.y -= v.y;
		return this.copy();
	}
	scale(v){
		this.x *= v;	
		this.y *= v;
		return this;
	}
	getx(){
		return this.x;
	}
	gety(){
		return this.y;
	}
}
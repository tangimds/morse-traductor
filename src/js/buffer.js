class Buffer{
    constructor(x,y,size){
      this.value = [];
      this.x = x;
      this.y = y;
      this.size = size;
    }
    
    add(x){
      this.value.push(x);
    }
    
    delete(){
      this.value.splice(this.value.length-1,1);
    }

    clear(){
        this.value = [];
    }

    update(){
      let t = "";
      let i = this.value.length-30;
      if(i<0)i=0;
      for(i ; i<this.value.length ; i++){
              t += this.value[i]      
      }
      t+='|';
      var morseTrad = document.getElementById("output_bip");
      morseTrad.innerHTML = t.toUpperCase();
    }  
  }
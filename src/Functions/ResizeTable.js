class ResizeTable {
    
  constructor(name){
        'use strict';
        this.onMove=undefined;
        this.onUp=undefined;
        this.moveLeft=undefined;
        this.moveRight=undefined;
        this.table_name = name;
        this.table = document.querySelector('#'+this.table_name);
        this.min_width = 15;
        this.columns = [];
        this.headerBeingResized = undefined;
        this.headerBeingMoved = undefined;
        this.startX = 0 ;
        this.startW = 0;
        this.styleEl = document.createElement('style');
        document.head.appendChild(this.styleEl);
        this.styleSheet = this.styleEl.sheet;
        this.run();
  }
	
  ChangeColumnVisible(e){
      var obj = this;
      var el = e.target;
      var col_visible;
      var column = this.columns.find(_ref=>_ref.col_name === el.id);
      
      var pos = obj.columns.indexOf(column);
      
      if(obj.columns[pos]) {
          if (obj.columns[pos].visible == 1) {
            obj.columns[pos].visible = 0
            obj.styleSheet.insertRule('#'+obj.table_name+" ."+el.id+" {display:none;}",obj.columns[pos].order);
          }
          else{
              obj.columns[pos].visible = 1;
              obj.styleSheet.deleteRule(obj.columns[pos].order);
          }
          localStorage.setItem(obj.table_name+'_columvisible_'+ obj.columns[pos].col_name, obj.columns[pos].visible );
      }
      
      var all_hidden = true;
      obj.columns.forEach(column=>{ if(column.visible==1) all_hidden=false; });
      
      if (all_hidden) {
        obj.columns[0].visible = 1;
        obj.styleSheet.deleteRule(obj.columns[0].order);
      }
      obj.refresh_columns();
  }
  
  config(_ref){
    _ref.preventDefault(); 
    var obj = this;
    var popupwin='<h2>Настройка отображения стобцов</h2>';
    obj.columns.forEach(column => {
                                    popupwin = popupwin + 'видимость \'<b>'+column.name+
                                    '</b>\'&nbsp<input class="columnVisible" id="'+
                                    column.col_name+'" type="checkbox" '+(column.visible==1?'checked':'')+'><br>' ;
                                  });
        popupwin = popupwin + '<button onclick="this.parentNode.parentNode.removeChild(this.parentNode);">Закрыть</button>'
    let el = document.createElement('div');
        el.className = "popup";
        el.innerHTML = popupwin;
        document.body.append(el);
    document.querySelectorAll('.columnVisible').forEach(item => item.addEventListener('change', (obj.ChangeColumnVisible).bind(obj))); 
  }
  
  
  onMouseMove(e) {
    var obj = this;
    // console.log("mouseMove");
    e.preventDefault();    // исключение выделения мышкой.
    return requestAnimationFrame(()=>{
      var horizontalScrollOffset = document.documentElement.scrollLeft;
      var width =  obj.startW + e.clientX - obj.startX;
      var column = obj.columns.find((_ref) => {
                                        var header = _ref.header;
                                        return header === obj.headerBeingResized;
                                      });
      if(column) column.size = Math.max(obj.min_width, width) + 'px'; // контроль минимальной ширины колонки
      if(column.col_name) {
        var col_name = column.col_name.match('col_[0-9a-zA-Z_]*')[0];     // получаем имя изменяемой колонки
        localStorage.setItem( obj.table_name+'_colum_'+col_name, Math.max(obj.min_width, width)); // сохраняем ширину в localstorage
        obj.columns.forEach(column=>{
          if (column.visible==1) {
            if (column.size.startsWith('minmax')) {
            column.size = parseInt(column.header.clientWidth, 10) + 'px';
            }
          }
        });
      }
  
      obj.table.setAttribute("style",'grid-template-columns:'+ obj.columns.map(column=>{
          if(column.visible==0) var size = '['+column.col_name+'] 0px ';
            else var size = '['+column.col_name+'] ' +column.size;
            
          return size;
        }).join(' ')
      );
    });
  }
 

  
  onMouseUp(){
    // Очистка event listeners, classes и т.д.
    var obj = this;
    //console.log("mouseUp");
    window.removeEventListener('mousemove', obj.onMove);   
    window.removeEventListener('mouseup', obj.onUp);
    obj.headerBeingResized.classList.remove('header--being-resized');
    obj.headerBeingResized = null;
  }
  
  refresh_columns(){
    var obj = this;
    obj.columns.sort((a, b)=> a.order - b.order); //сортируем по order
    obj.table.setAttribute("style",'grid-template-columns:'+ obj.columns.map(column=> { //начальная инициализация разремеров колонок.
          if(column.visible==0) var size = '['+column.col_name+'] 0px ';
              else var size = '['+column.col_name+'] ' +column.size;
          return size;
          }).join(' ')
       );
  }
  
  initResize(_ref3) {
    //console.log("initResize");
    var target = _ref3.target;
    this.startX = window.event.clientX; // начальтная позиция мышки по X при начале изменения размера
    this.headerBeingResized = target.parentNode;
    this.startW = this.headerBeingResized.getBoundingClientRect().width; // начальтная ширина столбца при начале изменения размера
    window.addEventListener('mousemove', this.onMove = (this.onMouseMove).bind(this));
    window.addEventListener('mouseup', this.onUp = (this.onMouseUp).bind(this));
    this.headerBeingResized.classList.add('header--being-resized');
  };
  
  MoveLeft(_ref){
	  var obj = this;
    var target = _ref.target;
	      //console.log(target.parentNode);
        obj.headerBeingMoved = target.parentNode;
        _ref.preventDefault();    //исключение выделения мышкой.
    var column = obj.columns.find(_ref=> _ref.header=== obj.headerBeingMoved);
	  //console.log(column);
    var pos = obj.columns.indexOf(column);    
    if(obj.columns[pos-1]) {
        obj.columns[pos-1].order++;
        obj.columns[pos].order--;
        localStorage.setItem(obj.table_name+'_columorder_'+obj.columns[pos-1].col_name, obj.columns[pos-1].order);
        localStorage.setItem(obj.table_name+'_columorder_'+obj.columns[pos].col_name, obj.columns[pos].order); 
    }
        
     obj.refresh_columns();
   }
   
  MoveRight(_ref){
    var obj = this;
      var target = _ref.target;
      obj.headerBeingMoved = target.parentNode;
      _ref.preventDefault();    //исключение выделения мышкой.
      var column = this.columns.find(_ref=> _ref.header === obj.headerBeingMoved);
      var pos = obj.columns.indexOf(column);    
      if(obj.columns[pos+1]) {
          obj.columns[pos+1].order--;
          obj.columns[pos].order++;
          localStorage.setItem(obj.table_name+'_columorder_'+obj.columns[pos+1].col_name, obj.columns[pos+1].order);
          localStorage.setItem(obj.table_name+'_columorder_'+obj.columns[pos].col_name, obj.columns[pos].order); 
      }
      obj.refresh_columns();
  }
  
  
  run(){
      var obj = this;
      obj.styleSheet.insertRule('#'+obj.table_name+' {position:relative; min-width: 100%; width: auto; flex: 1; display: grid; grid-auto-flow: column;}',0);
      obj.styleSheet.insertRule('#'+obj.table_name+' .resize-handle {opacity:0; position: absolute; top: 0; right: 0; bottom: 0; cursor: col-resize; border-left:solid 6px #000E; }',0);
      obj.styleSheet.insertRule('#'+obj.table_name+' th, #'+obj.table_name+' td { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',0);
      obj.styleSheet.insertRule('#'+obj.table_name+' thead, #'+obj.table_name+' tbody, #'+obj.table_name+' tr { display: contents; }',0);
      obj.styleSheet.insertRule('#'+obj.table_name+' .rowspan thead, #'+obj.table_name+' .rowspan tbody, #'+obj.table_name+' .rowspan tr { display: block; }',0);
      obj.styleSheet.insertRule('#'+obj.table_name+' th { position: sticky; top:0;grid-row-start:initial;}',0);
      
      obj.styleSheet.insertRule('#'+obj.table_name+' .move-handle-left, #'+obj.table_name+' .move-handle-right  { opacity:0;cursor: pointer;width: 16px;height: 16px;position: absolute;top: 0px;bottom: 0px;margin: auto;padding: 0px;background-color: #c9debd;border-radius: 50%;line-height: 16px;}',0);
      obj.styleSheet.insertRule('#'+obj.table_name+' .move-handle-left {left: 0.5em;}',0);
      obj.styleSheet.insertRule('#'+obj.table_name+' .move-handle-right{right: 0.5em;}',0);
      obj.styleSheet.insertRule('#'+obj.table_name+" .move-handle-left:before{content: '<';}",0);
      obj.styleSheet.insertRule('#'+obj.table_name+" .move-handle-right:before{content: '>';}",0);
      obj.styleSheet.insertRule('#'+obj.table_name+' th:hover .move-handle-left,  #'+obj.table_name+' th:hover .move-handle-right {opacity:0.5;}',0);
      obj.styleSheet.insertRule('.popup { z-index:999;position: fixed;background-color:#CCC;top:10%;left: 20%;right: 20%;display: inline-block; padding: 10px;border: solid 1px;}',0);
      obj.styleSheet.insertRule('#'+obj.table_name+' thead:hover .header--being-resized .resize-handle { opacity: 0.5 !important; background: black !important; }',0);
      obj.styleSheet.insertRule('#'+obj.table_name+' thead:hover .resize-handle {opacity:0.1 !important;}',0);

      var table = document.getElementById(obj.table_name);
  
      if(table && table.hasChildNodes()){
          var elems = document.querySelectorAll("#"+obj.table_name+" th");
          //console.log(elems.length)
          Array.from(elems).forEach(header => {
            var name = header.innerHTML.replace(/(\<(\/?[^>]+)>)/g, '');
            //console.log('header',header);
            header.innerHTML = '<div class="move-handle-left"></div><div class="move-handle-right"></div>'+header.innerHTML+'<span class="resize-handle">';
              if(header.querySelector('.resize-handle')){
                  var col_name = header.className.match('col_[0-9a-zA-Z_]*')[0];
                  var init_min;
                  if(localStorage.getItem(obj.table_name+'_colum_'+col_name)) {
                          init_min = localStorage.getItem(obj.table_name+'_colum_'+col_name);
                  }
                  else init_min = obj.min_width; 
              
                  var col_order;
                  var col_visible;
                  if(localStorage.getItem(obj.table_name+'_columorder_'+col_name)){
                    col_order = localStorage.getItem(obj.table_name+'_columorder_'+col_name);
                  }
                  else {col_order = obj.columns.length; localStorage.setItem(obj.table_name+'_columorder_'+col_name,col_order);} 
              
                  if(localStorage.getItem(obj.table_name+'_columvisible_'+col_name)){
                    col_visible = localStorage.getItem(obj.table_name+'_columvisible_'+col_name);
                  }
                  else {col_visible =1;
                        localStorage.setItem(obj.table_name+'_columvisible_'+col_name,col_visible);
                        } 
              
            
                  obj.styleSheet.insertRule('#'+obj.table_name+' .'+col_name+' { grid-column-start:'+col_name+';}',0);
              
                  obj.columns.push({
                      col_name: col_name,
                      name : name,
                      header: header,
                      size: init_min==obj.min_width ?'minmax(' + init_min + 'px, 1fr)': init_min+'px',
                      order: col_order,
                      visible: col_visible
                  });
              
                  obj.columns.sort((a, b)=>a.order - b.order);//сортируем по order
              
                  header.querySelector('.resize-handle').addEventListener('mousedown', (obj.initResize).bind(obj));
                  header.querySelector('.resize-handle').addEventListener('contextmenu', (obj.config).bind(obj));
              }
        });
 
    document.querySelectorAll('.move-handle-left').forEach(item=>{ item.addEventListener('click', (obj.MoveLeft).bind(obj));});
    
    document.querySelectorAll('.move-handle-right').forEach(item=>item.addEventListener('click', (obj.MoveRight).bind(obj))); 
    
    obj.table.setAttribute("style",'grid-template-columns:'+ obj.columns.map(column=> { //начальная инициализация разремеров колонок.
        if(column.visible==0) {var size = '['+column.col_name+'] 0px ';
              obj.styleSheet.insertRule('#'+obj.table_name+" ."+column.col_name+" {display:none;}",column.order);
        }
                else var size = '['+column.col_name+'] ' +column.size;
        return size;
        }).join(' ')
    );
  }
 }
}

export default ResizeTable
(function(){

"use strict";


/* ===========================
   APP COMPATIBILITY FIX
=========================== */


window.APP = window.APP || {};



if(typeof APP.ready !== "function"){


APP.ready = function(callback){


if(document.readyState === "loading"){


document.addEventListener(
"DOMContentLoaded",
callback
);


}
else{


callback();


}


};


}





/* ===========================
   YANDEX MAP LOADER
=========================== */


window.MapLoader = {


apiKey:"ВСТАВЬ_СЮДА_СВОЙ_API_KEY",


load:function(){


return new Promise((resolve,reject)=>{


if(window.ymaps){


resolve(window.ymaps);
return;


}



const script =
document.createElement(
"script"
);



script.src =
"https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey="
+
this.apiKey;



script.onload=function(){


ymaps.ready(()=>{


console.log(
"Yandex Maps loaded"
);


resolve(
ymaps
);


});


};



script.onerror=function(){


console.error(
"Ошибка загрузки Яндекс карт"
);


reject();


};



document.head.appendChild(script);



});


}


};




/* ===========================
   SAFE MAP INIT
=========================== */


APP.ready(()=>{


const mapContainer =
document.querySelector("#map");



if(!mapContainer)
return;



MapLoader.load()

.then((ymaps)=>{



if(window.projectMap)
return;



window.projectMap =
new ymaps.Map(
"map",
{

center:[
55.729,
37.428
],

zoom:14,

controls:[
"zoomControl",
"fullscreenControl"
]


});



console.log(
"Карта проекта создана"
);



})

.catch(()=>{


console.warn(
"Яндекс карты недоступны"
);


});



});



})();
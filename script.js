/* =====================================================
   PROJECT APP SCRIPT
   Optimized modular JS
   No conflicts / no duplicate initialization
===================================================== */

(() => {
"use strict";


/* ============================
   GLOBAL APP OBJECT
============================ */

if (window.ProjectApp) {
    console.warn("ProjectApp already initialized");
    return;
}

window.ProjectApp = {
    version: "1.0",
    modules: {}
};


/* ============================
   DOM READY
============================ */

document.addEventListener("DOMContentLoaded", () => {

    ProjectApp.modules.interface.init();
    ProjectApp.modules.map.init();
    ProjectApp.modules.transport.init();
    ProjectApp.modules.plan.init();
    ProjectApp.modules.animation.init();

});


/* ============================
   INTERFACE
============================ */

ProjectApp.modules.interface = {

    init(){

        this.menu();
        this.buttons();
        this.scroll();

    },


    menu(){

        const toggle =
        document.querySelector(".menu-toggle");

        const menu =
        document.querySelector(".nav-menu");


        if(!toggle || !menu) return;


        toggle.addEventListener("click",()=>{

            menu.classList.toggle("active");

        });

    },


    buttons(){

        document.querySelectorAll("[data-scroll]")
        .forEach(btn=>{

            btn.addEventListener("click",()=>{

                const target =
                document.querySelector(
                    btn.dataset.scroll
                );


                if(target){

                    target.scrollIntoView({
                        behavior:"smooth"
                    });

                }

            });

        });

    },


    scroll(){

        const header =
        document.querySelector("header");


        if(!header)return;


        window.addEventListener(
            "scroll",
            ()=>{

                header.classList.toggle(
                    "scrolled",
                    window.scrollY>50
                );

            }
        );

    }

};



/* ============================
   MAP MODULE
   YANDEX MAP READY
============================ */

ProjectApp.modules.map = {


    map:null,


    init(){


        const container =
        document.getElementById(
            "map"
        );


        if(!container) return;


        if(typeof ymaps === "undefined"){

            console.warn(
              "Yandex Maps API not loaded"
            );

            return;

        }



        ymaps.ready(()=>{


            this.map =
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



            this.addObjects();


        });


    },


    addObjects(){


        if(!this.map)return;


        const objects = [

            {
                name:"Центральная зона проекта",
                coords:[
                    55.729,
                    37.428
                ]
            }

        ];


        objects.forEach(item=>{


            const mark =
            new ymaps.Placemark(

                item.coords,

                {
                    balloonContent:
                    item.name
                },

                {
                    preset:
                    "islands#blueCircleDotIcon"
                }

            );


            this.map.geoObjects.add(mark);


        });


    }


};



/* ============================
   TRANSPORT MODULE
============================ */

ProjectApp.modules.transport={


init(){


const buttons =
document.querySelectorAll(
".transport-btn"
);


if(!buttons.length)return;



buttons.forEach(btn=>{


btn.addEventListener(
"click",
()=>{


const type =
btn.dataset.transport;


this.show(type);


});


});


},



show(type){


const blocks =
document.querySelectorAll(
"[data-route]"
);


blocks.forEach(block=>{


block.style.display =
block.dataset.route===type
?
"block"
:
"none";


});


}


};



/* ============================
   MASTER PLAN MODULE
============================ */

ProjectApp.modules.plan={


init(){


const items =
document.querySelectorAll(
".plan-object"
);



if(!items.length)return;



items.forEach(item=>{


item.addEventListener(
"mouseenter",
()=>{

item.classList.add(
"active"
);

});


item.addEventListener(
"mouseleave",
()=>{

item.classList.remove(
"active"
);

});


});


}


};




/* ============================
   ANIMATION MODULE
============================ */

ProjectApp.modules.animation={


init(){


const elements =
document.querySelectorAll(
".animate"
);



if(!elements.length)return;



const observer =
new IntersectionObserver(

(entries)=>{


entries.forEach(entry=>{


if(entry.isIntersecting){


entry.target.classList.add(
"visible"
);


}


});


},

{
threshold:0.15
}

);



elements.forEach(el=>
observer.observe(el)
);



}


};



})();
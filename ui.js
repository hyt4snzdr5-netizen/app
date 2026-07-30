/* =========================================================
   UI MODULE
   Панель управления проектом
   CityProject
   Совместим с:
   script.js
   transport.js
   genplan.js
========================================================= */

(() => {

"use strict";


window.CityProject =
window.CityProject || {};


const APP =
window.CityProject;



/* =====================================================
   СОСТОЯНИЕ ИНТЕРФЕЙСА
===================================================== */


APP.ui = {

    visible: {

        transport:true,

        genplan:true,

        infrastructure:true

    }

};




/* =====================================================
   ПЕРЕКЛЮЧЕНИЕ СЛОЯ
===================================================== */


APP.ui.toggleLayer =
function(
    collection,
    visible
){


    if(!collection)
        return;



    collection.forEach(

        object => {


            if(
                visible
            ){

                APP.map.geoObjects.add(
                    object
                );

            }

            else {

                APP.map.geoObjects.remove(
                    object
                );

            }


        }

    );

};




/* =====================================================
   ТРАНСПОРТ
===================================================== */


APP.ui.toggleTransport =
function(){


    APP.ui.visible.transport =
    !APP.ui.visible.transport;



    if(
        APP.transport
    ){


        APP.ui.toggleLayer(

            [

                ...APP.transport.routes,

                ...APP.transport.stops,

                ...APP.transport.roads

            ],

            APP.ui.visible.transport

        );


    }


};





/* =====================================================
   ГЕНПЛАН
===================================================== */


APP.ui.toggleGenplan =
function(){


    APP.ui.visible.genplan =
    !APP.ui.visible.genplan;



    if(
        APP.genplan
    ){


        APP.ui.toggleLayer(

            [

                ...APP.genplan.buildings,

                ...APP.genplan.zones,

                ...APP.genplan.infrastructure

            ],

            APP.ui.visible.genplan

        );


    }


};





/* =====================================================
   РЕЖИМ ПРЕЗЕНТАЦИИ
===================================================== */


APP.ui.presentationMode =
function(){


    document.body.classList.toggle(

        "presentation-mode"

    );


};





/* =====================================================
   АВТОСОЗДАНИЕ КНОПОК
===================================================== */


APP.ui.createPanel =
function(){


    if(
        document.querySelector(
            ".project-control-panel"
        )
    )
        return;




    const panel =
    document.createElement(
        "div"
    );



    panel.className =
    "project-control-panel";



    panel.innerHTML = `

        <button data-ui="transport">
            🚍 Транспорт
        </button>


        <button data-ui="genplan">
            🏗 Генплан
        </button>


        <button data-ui="presentation">
            📊 Презентация
        </button>


    `;



    document.body.appendChild(
        panel
    );





    panel
    .addEventListener(

        "click",

        event => {


            const action =
            event.target.dataset.ui;



            if(
                action==="transport"
            ){

                APP.ui.toggleTransport();

            }



            if(
                action==="genplan"
            ){

                APP.ui.toggleGenplan();

            }



            if(
                action==="presentation"
            ){

                APP.ui.presentationMode();

            }


        }

    );


};




/* =====================================================
   ЗАПУСК
===================================================== */


APP.ready(()=>{


    APP.ui.createPanel();



    console.log(
        "UI module loaded"
    );


});



})();
/* =========================================================
   GENPLAN MODULE
   Генеральный план территории
   CityProject
   Совместим с script.js + transport.js
========================================================= */

(() => {

"use strict";


window.CityProject =
window.CityProject || {};


const APP =
window.CityProject;



/* =====================================================
   ХРАНЕНИЕ ОБЪЕКТОВ ГЕНПЛАНА
===================================================== */


APP.genplan = {

    buildings: [],

    zones: [],

    infrastructure: []

};



/* =====================================================
   СОЗДАНИЕ ЗДАНИЯ
===================================================== */


APP.genplan.addBuilding =
function(
    coordinates,
    name,
    type
){


    if(!APP.map)
        return;



    const building =
    new ymaps.Polygon(

        [

            coordinates

        ],

        {

            balloonContent:

            `
            <b>${name}</b><br>
            Тип объекта: ${type}
            `

        },

        {

            strokeWidth:2,

            fillOpacity:0.35

        }

    );



    APP.map.geoObjects.add(
        building
    );


    APP.genplan.buildings.push(
        building
    );


    return building;

};




/* =====================================================
   СОЗДАНИЕ ЗОНЫ
===================================================== */


APP.genplan.addZone =
function(
    coordinates,
    name
){


    if(!APP.map)
        return;



    const zone =
    new ymaps.Polygon(

        [

            coordinates

        ],

        {

            balloonContent:

            `
            <b>${name}</b>
            `

        },

        {

            strokeWidth:1,

            fillOpacity:0.2

        }

    );



    APP.map.geoObjects.add(zone);



    APP.genplan.zones.push(
        zone
    );


};




/* =====================================================
   ДОБАВЛЕНИЕ ИНФРАСТРУКТУРЫ
===================================================== */


APP.genplan.addObject =
function(
    coords,
    name
){


    if(!APP.map)
        return;



    const object =
    new ymaps.Placemark(

        coords,

        {

            iconCaption:name,

            balloonContent:name

        }

    );



    APP.map.geoObjects.add(
        object
    );


    APP.genplan.infrastructure.push(
        object
    );


};




/* =====================================================
   АВТОМАТИЧЕСКАЯ ЗАГРУЗКА ГЕНПЛАНА
===================================================== */


APP.genplan.load =
function(){


    /*
        ЦМТО / склад
    */


    APP.genplan.addBuilding(

        [

            [

                55.7188,
                37.4190

            ],

            [

                55.7188,
                37.4215

            ],

            [

                55.7202,
                37.4215

            ],

            [

                55.7202,
                37.4190

            ]

        ],

        "Главный склад ЦМТО",

        "Складской комплекс"

    );




    /*
        Ремонтная зона
    */


    APP.genplan.addZone(

        [

            [

                55.7175,
                37.4200

            ],

            [

                55.7175,
                37.4225

            ],

            [

                55.7185,
                37.4225

            ],

            [

                55.7185,
                37.4200

            ]

        ],

        "Ремонтная база"

    );





    /*
        Парковка техники
    */


    APP.genplan.addZone(

        [

            [

                55.719,
                37.423

            ],

            [

                55.719,
                37.425

            ],

            [

                55.720,
                37.425

            ],

            [

                55.720,
                37.423

            ]

        ],

        "Парковка спецтехники"

    );





    /*
        Объекты
    */


    APP.genplan.addObject(

        [
            55.7195,
            37.4205
        ],

        "КПП / въезд"

    );



    APP.genplan.addObject(

        [
            55.719,
            37.424
        ],

        "Погрузочная зона"

    );



};




/* =====================================================
   ОЧИСТКА
===================================================== */


APP.genplan.clear =
function(){


    if(!APP.map)
        return;



    [

        ...APP.genplan.buildings,

        ...APP.genplan.zones,

        ...APP.genplan.infrastructure


    ]

    .forEach(

        item => {

            APP.map.geoObjects.remove(item);

        }

    );



    APP.genplan.buildings=[];

    APP.genplan.zones=[];

    APP.genplan.infrastructure=[];


};




console.log(
"Genplan module loaded"
);



})();
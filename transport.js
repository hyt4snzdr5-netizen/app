/* =========================================================
   TRANSPORT MODULE
   Модуль транспорта для CityProject
   Работает совместно с script.js
   Без глобальных конфликтов
========================================================= */

(() => {

    "use strict";


    window.CityProject =
        window.CityProject || {};


    const APP =
        window.CityProject;



    /* =====================================================
       НАСТРОЙКИ ТРАНСПОРТА
    ===================================================== */


    APP.transport =
    {

        routes: [],

        stops: [],

        roads: []

    };



    /* =====================================================
       ДОБАВЛЕНИЕ ОСТАНОВКИ
    ===================================================== */


    APP.transport.addStop =
    function(
        coords,
        name
    ){


        if(!APP.map)
            return;



        const stop =
            new ymaps.Placemark(

                coords,

                {

                    iconCaption:
                        name,

                    balloonContent:
                        `
                        <b>${name}</b><br>
                        Остановка общественного транспорта
                        `

                },

                {

                    preset:
                    "islands#blueCircleDotIcon"

                }

            );



        APP.map.geoObjects.add(stop);


        APP.transport.stops.push(stop);



        return stop;

    };



    /* =====================================================
       СОЗДАНИЕ МАРШРУТА
    ===================================================== */


    APP.transport.addRoute =
    function(
        points,
        name
    ){



        if(!APP.map)
            return;



        const route =
        new ymaps.Polyline(

            points,

            {

                balloonContent:
                `
                <b>${name}</b><br>
                Транспортный маршрут
                `

            },

            {

                strokeWidth:5,

                strokeOpacity:0.8

            }

        );



        APP.map.geoObjects.add(route);



        APP.transport.routes.push(route);



        return route;


    };



    /* =====================================================
       ДОРОГИ
    ===================================================== */


    APP.transport.addRoad =
    function(points){


        if(!APP.map)
            return;



        const road =
        new ymaps.Polyline(

            points,

            {},

            {

                strokeWidth:8,

                strokeOpacity:0.7

            }

        );


        APP.map.geoObjects.add(road);



        APP.transport.roads.push(road);



        return road;


    };



    /* =====================================================
       ПРИМЕР ГЕНЕРАЦИИ ТРАНСПОРТНОЙ СЕТИ
    ===================================================== */


    APP.transport.loadDemo =
    function(){



        // автобусная остановка

        APP.transport.addStop(

            [
                55.7195,
                37.4205
            ],

            "Остановка №1"

        );



        APP.transport.addStop(

            [
                55.7205,
                37.4235
            ],

            "Остановка №2"

        );




        // автобусный маршрут


        APP.transport.addRoute(

            [

                [
                    55.718,
                    37.418
                ],

                [
                    55.720,
                    37.421
                ],

                [
                    55.722,
                    37.425
                ]

            ],

            "Автобусный маршрут 1"

        );





        // новая дорога


        APP.transport.addRoad(

            [

                [
                    55.717,
                    37.417
                ],

                [
                    55.722,
                    37.426
                ]

            ]

        );



    };




    /* =====================================================
       ОЧИСТКА ТРАНСПОРТА
    ===================================================== */


    APP.transport.clear =
    function(){


        if(!APP.map)
            return;



        [
            ...APP.transport.routes,

            ...APP.transport.stops,

            ...APP.transport.roads

        ]

        .forEach(
            item=>{

                APP.map.geoObjects.remove(item);

            }
        );



        APP.transport.routes=[];

        APP.transport.stops=[];

        APP.transport.roads=[];


    };



    console.log(
        "Transport module loaded"
    );



})();
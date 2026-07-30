/* =========================================================
   PROJECT SCRIPT
   Изолированный JS-модуль
   Не конфликтует с HTML/CSS и другими скриптами
========================================================= */

(() => {
    "use strict";

    // Уникальное пространство приложения
    window.CityProject = window.CityProject || {};

    const APP = window.CityProject;


    /* =====================================================
       НАСТРОЙКИ
    ===================================================== */

    APP.config = {
        mapId: "project-map",
        center: [55.720, 37.420], // заменить на участок проекта
        zoom: 15
    };


    /* =====================================================
       ЗАЩИТА DOM
    ===================================================== */

    APP.ready = function(callback) {
        if (document.readyState === "loading") {
            document.addEventListener(
                "DOMContentLoaded",
                callback,
                {once:true}
            );
        } else {
            callback();
        }
    };


    /* =====================================================
       ЯНДЕКС КАРТА
    ===================================================== */

    APP.map = null;


    APP.initMap = function() {

        if (!window.ymaps) {
            console.warn(
                "Yandex Maps API не найден"
            );
            return;
        }


        if (APP.map) {
            console.warn(
                "Карта уже создана"
            );
            return;
        }


        ymaps.ready(() => {


            const container =
                document.getElementById(APP.config.mapId);


            if (!container) {
                console.warn(
                    "Контейнер карты отсутствует"
                );
                return;
            }


            APP.map = new ymaps.Map(
                APP.config.mapId,
                {
                    center:
                        APP.config.center,

                    zoom:
                        APP.config.zoom,

                    controls:[
                        "zoomControl",
                        "fullscreenControl"
                    ]
                }
            );


            APP.addLayers();


        });

    };



    /* =====================================================
       ОБЪЕКТЫ КАРТЫ
    ===================================================== */


    APP.layers = [];


    APP.addLayers = function(){


        if(!APP.map) return;


        // пример территории проекта

        const territory =
            new ymaps.Polygon(
                [
                    [
                        [55.721,37.418],
                        [55.721,37.425],
                        [55.717,37.425],
                        [55.717,37.418]
                    ]
                ],
                {},
                {
                    fillOpacity:0.25,
                    strokeWidth:2
                }
            );


        APP.map.geoObjects.add(
            territory
        );


        APP.layers.push(
            territory
        );

    };



    /* =====================================================
       ДОБАВЛЕНИЕ ОБЪЕКТОВ
    ===================================================== */


    APP.addObject = function(
        coordinates,
        title,
        description
    ){

        if(!APP.map) return;


        const placemark =
            new ymaps.Placemark(
                coordinates,
                {
                    balloonContentHeader:title,
                    balloonContentBody:
                        description
                }
            );


        APP.map.geoObjects.add(
            placemark
        );


        APP.layers.push(
            placemark
        );


        return placemark;

    };



    /* =====================================================
       ТРАНСПОРТНЫЕ ЛИНИИ
    ===================================================== */


    APP.addRoute = function(points){


        if(!APP.map) return;


        const route =
            new ymaps.Polyline(
                points,
                {},
                {
                    strokeWidth:4
                }
            );


        APP.map.geoObjects.add(
            route
        );


        APP.layers.push(
            route
        );


    };



    /* =====================================================
       КНОПКИ ИНТЕРФЕЙСА
    ===================================================== */


    APP.bindButtons = function(){


        document
        .querySelectorAll("[data-action]")
        .forEach(button=>{


            button.addEventListener(
                "click",
                ()=>{


                    const action =
                        button.dataset.action;


                    if(
                        typeof APP[action]
                        === "function"
                    ){

                        APP[action]();

                    }


                }
            );


        });


    };



    /* =====================================================
       ОЧИСТКА КАРТЫ
    ===================================================== */


    APP.clearMap = function(){


        if(!APP.map)
            return;


        APP.layers.forEach(
            item=>{
                APP.map.geoObjects.remove(item);
            }
        );


        APP.layers=[];


    };



    /* =====================================================
       ЗАПУСК
    ===================================================== */


    APP.ready(()=>{


        APP.initMap();

        APP.bindButtons();


        console.log(
            "CityProject JS запущен"
        );


    });



})();
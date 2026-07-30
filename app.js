/* =====================================================
   APP.JS
   CMTO / MTO PROJECT
   Yandex Maps integration
   Optimized version
===================================================== */

"use strict";

window.APP = window.APP || {};

(function () {

    const CONFIG = {

        yandexApiKey: "ab2476bf-2ea1-4863-87a0-654eb6b41e0f",

        // ЗАМЕНИ НА СВОИ КООРДИНАТЫ ИЗ ГЕНПЛАНА
        points: {

            warehouse: [
                55.736000,
                37.420000
            ],

            mtoHeadOffice: [
                55.725000,
                37.430000
            ]
        },

        mapCenter: [
            55.730000,
            37.425000
        ],

        zoom: 13

    };


    APP.config = CONFIG;


    APP.ready = function(callback){

        if(typeof ymaps !== "undefined"){

            ymaps.ready(callback);

        } else {

            console.warn(
                "Yandex Maps API еще не загружен"
            );

            document.addEventListener(
                "yandex-ready",
                callback,
                {once:true}
            );
        }

    };



    function loadYandexMaps(){

        if(window.ymaps){

            document.dispatchEvent(
                new Event("yandex-ready")
            );

            return;
        }


        const script=document.createElement("script");

        script.src =
        "https://api-maps.yandex.ru/2.1/?apikey="
        + CONFIG.yandexApiKey
        +"&lang=ru_RU";


        script.onload=function(){

            console.log(
                "Yandex Maps API загружен"
            );

            ymaps.ready(function(){

                document.dispatchEvent(
                    new Event("yandex-ready")
                );

            });

        };


        script.onerror=function(){

            console.error(
                "Ошибка загрузки Yandex Maps API"
            );

        };


        document.head.appendChild(script);

    }



    function createMap(){

        if(!document.getElementById("map")){

            console.error(
                "Не найден контейнер #map"
            );

            return;

        }


        const map =
        new ymaps.Map(
            "map",
            {
                center:
                CONFIG.mapCenter,

                zoom:
                CONFIG.zoom,

                controls:[
                    "zoomControl",
                    "fullscreenControl",
                    "typeSelector"
                ]

            }
        );


        // склад

        const warehouse =
        new ymaps.Placemark(

            CONFIG.points.warehouse,

            {
                balloonContent:
                `
                <b>Центральный склад ЦМТО</b><br>
                ГБУ Жилищник района Кунцево<br>
                Логистика материалов
                `
            },

            {
                preset:
                "islands#redWarehouseIcon"
            }

        );



        // головной отдел

        const office =
        new ymaps.Placemark(

            CONFIG.points.mtoHeadOffice,

            {

                balloonContent:
                `
                <b>Головной отдел МТО</b><br>
                Управление снабжением<br>
                Планирование и контроль
                `

            },

            {

                preset:
                "islands#blueGovernmentIcon"

            }

        );



        map.geoObjects
        .add(warehouse)
        .add(office);



        // линия логистики

        const route =
        new ymaps.GeoObject(

            {

                geometry:
                {

                    type:
                    "LineString",

                    coordinates:
                    [

                        CONFIG.points.mtoHeadOffice,

                        CONFIG.points.warehouse

                    ]

                }

            },

            {

                strokeWidth:4,

                strokeColor:"#0078ff"

            }

        );


        map.geoObjects.add(route);



        window.MTO_MAP = map;


        console.log(
            "Карта МТО успешно создана"
        );

    }




    APP.init=function(){

        APP.ready(
            createMap
        );

    };



    loadYandexMaps();



})();
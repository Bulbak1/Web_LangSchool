let myMap;
let allPlacemarks = [];

const learningResources = [
    {
        coords: [55.763022, 37.634874],
        name: 'Городская библиотека "Читай-город"',
        address: 'Москва, ул. Мясницкая, д. 15',
        hours: 'Пн-Пт: 9:00 - 20:00, Сб: 10:00 - 18:00',
        contact: '+7 (495) 621-33-44',
        description: 'Библиотека с большой коллекцией книг на ' +
            'английском, немецком и французском языках',
        type: 'library'
    },
    {
        coords: [55.751381, 37.645249],
        name: 'Центральная библиотека "Книжный мир"',
        address: 'Москва, Яузский бульвар, д. 10',
        hours: 'Вт-Сб: 10:00 - 19:00',
        contact: '+7 (499) 267-55-21',
        description: 'Специализированная секция иностранной ' +
            'литературы, читальный зал',
        type: 'library'
    },
    {
        coords: [55.770431, 37.599193],
        name: 'Языковая академия "ЛингваПро"',
        address: 'Москва, ул. Садовая-Триумфальная, д. 4',
        hours: 'Пн-Вс: 8:00 - 22:00',
        contact: '+7 (495) 788-22-11',
        description: 'Курсы английского, испанского, китайского и ' +
            'арабского языков с сертификацией',
        type: 'course'
    },
    {
        coords: [55.716017, 37.646444],
        name: 'Дворец культуры "Современник"',
        address: 'Москва, Павелецкая набережная, д. 2',
        hours: 'Ежедневно: 11:00 - 21:00',
        contact: '+7 (495) 953-44-78',
        description: 'Культурные программы, языковые фестивали и ' +
            'мастер-классы по изучению языков',
        type: 'center'
    },
    {
        coords: [55.772502, 37.608949],
        name: 'Кафе-клуб "Language Corner"',
        address: 'Москва, Каретный ряд, д. 5/10',
        hours: 'Чт-Вс: 15:00 - 24:00',
        contact: '+7 (499) 455-78-33',
        description: 'Языковые вечера по четвергам, общение с ' +
            'иностранцами в непринужденной обстановке',
        type: 'cafe'
    },
    {
        coords: [55.740907, 37.524453],
        name: 'Разговорный клуб "English Point"',
        address: 'Москва, Кутузовский проспект, д. 36',
        hours: 'Ср, Пт: 19:00 - 22:00',
        contact: '+7 (495) 444-12-89',
        description: 'Бесплатные встречи для практики английского ' +
            'языка, дискуссии на актуальные темы',
        type: 'club'
    },
    {
        coords: [55.775844, 37.692797],
        name: 'Районная библиотека им. Пушкина',
        address: 'Москва, ул. Большая Почтовая, д. 16',
        hours: 'Пн-Пт: 10:00 - 19:00',
        contact: '+7 (499) 231-66-54',
        description: 'Отдел зарубежной литературы, регулярные ' +
            'книжные клубы на иностранных языках',
        type: 'library'
    },
    {
        coords: [55.781053, 37.599911],
        name: 'Школа "Полиглот"',
        address: 'Москва, ул. Новослободская, д. 14/19',
        hours: 'Пн-Сб: 9:00 - 20:00',
        contact: '+7 (495) 684-90-45',
        description: 'Языковые курсы для детей и взрослых, ' +
            'подготовка к международным экзаменам',
        type: 'course'
    },
    {
        coords: [55.737324, 37.657170],
        name: 'Интернациональный клуб "Unity"',
        address: 'Москва, Воронцовская ул., д. 20',
        hours: 'Сб-Вс: 14:00 - 20:00',
        contact: '+7 (499) 678-45-23',
        description: 'Встречи с носителями разных языков, ' +
            'культурный обмен, настольные игры',
        type: 'club'
    },
    {
        coords: [55.705853, 37.631874],
        name: 'Центр досуга "Горизонт"',
        address: 'Москва, Автозаводская ул., д. 26/1',
        hours: 'Вт-Вс: 10:00 - 21:00',
        contact: '+7 (495) 675-88-92',
        description: 'Языковые кружки, киноклубы на оригинальном ' +
            'языке, творческие мастерские',
        type: 'center'
    }
];

function initMap() {
    if (typeof ymaps === 'undefined') {
        console.error('Яндекс.Карты не загружены');
        document.getElementById('map').innerHTML = `
            <div class="alert alert-warning text-center m-3">
                <h5>Карта недоступна</h5>
                <p>Проверьте подключение к Яндекс.Картам</p>
            </div>
        `;
        return;
    }

    ymaps.ready(() => {
        myMap = new ymaps.Map('map', {
            center: [55.751244, 37.618423],
            zoom: 11,
            controls: ['zoomControl', 'typeSelector']
        });

        createPlacemarks();
        addFilterPanel();
    });
}

function createPlacemarks() {
    allPlacemarks = [];

    learningResources.forEach(resource => {
        const placemark = new ymaps.Placemark(
            resource.coords,
            {
                balloonContentHeader: `<strong>${
                    resource.name
                }</strong>`,
                balloonContentBody: `
                    <div style="max-width: 300px;">
                        <p><strong>Адрес:</strong> ${
    resource.address
}</p>
                        <p><strong>Часы работы:</strong> ${
    resource.hours
}</p>
                        <p><strong>Телефон:</strong> ${
    resource.contact
}</p>
                        <p>${resource.description}</p>
                    </div>
                `,
                hintContent: resource.name
            },
            {
                preset: 'islands#circleIcon',
                iconColor: getColorByType(resource.type)
            }
        );

        placemark.properties.set('resourceType', resource.type);

        allPlacemarks.push({
            placemark: placemark,
            type: resource.type
        });

        myMap.geoObjects.add(placemark);
    });
}

function addFilterPanel() {
    const filterPanel = document.createElement('div');
    filterPanel.id = 'map-filter-panel';
    filterPanel.className = 'map-filter-overlay';

    filterPanel.innerHTML = `
        <div class="filter-content">
            <h6 class="filter-title">Фильтры</h6>
            <div class="filter-item">
                <input 
                    class="filter-checkbox" 
                    type="checkbox" 
                    id="filter-library" 
                    value="library" 
                    checked
                >
                <label class="filter-label" for="filter-library">
                    <span class="filter-dot library-dot"></span> 
                    Библиотеки
                </label>
            </div>
            <div class="filter-item">
                <input 
                    class="filter-checkbox" 
                    type="checkbox" 
                    id="filter-course" 
                    value="course" 
                    checked
                >
                <label class="filter-label" for="filter-course">
                    <span class="filter-dot course-dot"></span> 
                    Языковые школы
                </label>
            </div>
            <div class="filter-item">
                <input 
                    class="filter-checkbox" 
                    type="checkbox" 
                    id="filter-club" 
                    value="club" 
                    checked
                >
                <label class="filter-label" for="filter-club">
                    <span class="filter-dot club-dot"></span> 
                    Языковые клубы
                </label>
            </div>
            <div class="filter-item">
                <input 
                    class="filter-checkbox" 
                    type="checkbox" 
                    id="filter-cafe" 
                    value="cafe" 
                    checked
                >
                <label class="filter-label" for="filter-cafe">
                    <span class="filter-dot cafe-dot"></span> 
                    Языковые кафе
                </label>
            </div>
            <div class="filter-item">
                <input 
                    class="filter-checkbox" 
                    type="checkbox" 
                    id="filter-center" 
                    value="center" 
                    checked
                >
                <label class="filter-label" for="filter-center">
                    <span class="filter-dot center-dot"></span> 
                    Культурные центры
                </label>
            </div>
            <button 
                class="filter-apply-btn" 
                onclick="applyMapFilters()"
            >
                Применить фильтры
            </button>
        </div>
    `;

    document.getElementById('map').appendChild(filterPanel);
}

function applyMapFilters() {
    const filters = {
        library: document.getElementById('filter-library').checked,
        course: document.getElementById('filter-course').checked,
        club: document.getElementById('filter-club').checked,
        cafe: document.getElementById('filter-cafe').checked,
        center: document.getElementById('filter-center').checked
    };

    allPlacemarks.forEach(item => {
        if (filters[item.type]) {
            item.placemark.options.set('visible', true);
        } else {
            item.placemark.options.set('visible', false);
        }
    });
}

function getColorByType(type) {
    const colors = {
        library: '#3f51b5',
        course: '#4caf50',
        club: '#ff9800',
        cafe: '#f44336',
        center: '#9c27b0'
    };
    return colors[type] || '#757575';
}

if (document.getElementById('map')) {
    initMap();
}

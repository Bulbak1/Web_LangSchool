let allCourses = [];
let allTutors = [];
let filteredCourses = [];
let filteredTutors = [];
let currentCoursePage = 1;
const coursesPerPage = 3;
let selectedCourse = null;
let selectedTutor = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadCourses();
    await loadTutors();
    setupEventListeners();
});

async function loadCourses() {
    try {
        allCourses = await api.getCourses();
        filteredCourses = [...allCourses];
        populateCourseLanguages();
        displayCourses();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function populateCourseLanguages() {
    const languageSet = new Set();
    allCourses.forEach(course => {
        const courseName = course.name.toLowerCase();
        if (courseName.includes('russian')) {
            languageSet.add('Russian');
        }
        if (courseName.includes('english')) {
            languageSet.add('English');
        }
        if (courseName.includes('spanish')) {
            languageSet.add('Spanish');
        }
        if (courseName.includes('german')) {
            languageSet.add('German');
        }
        if (courseName.includes('french')) {
            languageSet.add('French');
        }
        if (courseName.includes('chinese')) {
            languageSet.add('Chinese');
        }
        if (courseName.includes('japanese')) {
            languageSet.add('Japanese');
        }
    });

    const languageSelect = document.getElementById(
        'course-search-language'
    );
    languageSet.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = translateLanguage(lang);
        languageSelect.appendChild(option);
    });
}

function translateLanguage(lang) {
    const translations = {
        'Russian': 'Русский',
        'English': 'Английский',
        'Spanish': 'Испанский',
        'German': 'Немецкий',
        'French': 'Французский',
        'Chinese': 'Китайский',
        'Japanese': 'Японский'
    };
    return translations[lang] || lang;
}

async function loadTutors() {
    try {
        allTutors = await api.getTutors();
        filteredTutors = [...allTutors];
        populateTutorLanguages();
        displayTutors();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function populateTutorLanguages() {
    const languageSet = new Set();
    allTutors.forEach(tutor => {
        tutor.languages_offered.forEach(lang => {
            languageSet.add(lang);
        });
    });

    const languageSelect = document.getElementById(
        'tutor-search-language'
    );
    languageSet.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = translateLanguage(lang);
        languageSelect.appendChild(option);
    });
}

function displayCourses() {
    const coursesList = document.getElementById('courses-list');
    const start = (currentCoursePage - 1) * coursesPerPage;
    const end = start + coursesPerPage;
    const coursesToDisplay = filteredCourses.slice(start, end);

    coursesList.innerHTML = '';

    coursesToDisplay.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'col-md-4 course-card';
        courseCard.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${course.name}</h5>
                    <p class="card-text">
                        ${course.description}
                    </p>
                    <p class="mb-1">
                        <strong>Преподаватель:</strong> 
                        ${course.teacher}
                    </p>
                    <p class="mb-1">
                        <strong>Уровень:</strong> ${course.level}
                    </p>
                    <p class="mb-1">
                        <strong>Продолжительность:</strong> 
                        ${course.total_length} недель
                    </p>
                    <p class="mb-3">
                        <strong>Стоимость:</strong> 
                        ${course.course_fee_per_hour} руб./час
                    </p>
                    <button 
                        class="btn btn-primary btn-enroll w-100" 
                        data-course-id="${course.id}"
                    >
                        Записаться
                    </button>
                </div>
            </div>
        `;
        coursesList.appendChild(courseCard);
    });

    displayCoursesPagination();
}

function displayCoursesPagination() {
    const pagination = document.getElementById('courses-pagination');
    const totalPages = Math.ceil(
        filteredCourses.length / coursesPerPage
    );

    pagination.innerHTML = '';

    if (totalPages <= 1) {
        return;
    }

    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${
        currentCoursePage === 1 ? 'disabled' : ''
    }`;
    prevLi.innerHTML = `
        <a class="page-link" href="#courses" data-page="prev">
            Предыдущая
        </a>
    `;
    pagination.appendChild(prevLi);

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${
            i === currentCoursePage ? 'active' : ''
        }`;
        li.innerHTML = `
            <a class="page-link" href="#courses" data-page="${i}">
                ${i}
            </a>
        `;
        pagination.appendChild(li);
    }

    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${
        currentCoursePage === totalPages ? 'disabled' : ''
    }`;
    nextLi.innerHTML = `
        <a class="page-link" href="#courses" data-page="next">
            Следующая
        </a>
    `;
    pagination.appendChild(nextLi);
}

function displayTutors() {
    const tutorsList = document.getElementById('tutors-list');
    tutorsList.innerHTML = '';

    filteredTutors.forEach(tutor => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${tutor.name}</td>
            <td>${tutor.language_level}</td>
            <td>${tutor.languages_offered.join(', ')}</td>
            <td>${tutor.work_experience}</td>
            <td>${tutor.price_per_hour}</td>
            <td>
                <button 
                    class="btn btn-success btn-sm" 
                    data-tutor-id="${tutor.id}"
                >
                    Выбрать
                </button>
            </td>
        `;
        tutorsList.appendChild(row);
    });
}

function setupEventListeners() {
    document.getElementById('courses-list').addEventListener(
        'click',
        e => {
            if (e.target.classList.contains('btn-enroll')) {
                const courseId = parseInt(
                    e.target.dataset.courseId
                );
                openCourseModal(courseId);
            }
        }
    );

    document.getElementById('tutors-list').addEventListener(
        'click',
        e => {
            if (e.target.classList.contains('btn-success')) {
                const tutorId = parseInt(e.target.dataset.tutorId);
                openTutorModal(tutorId);
            }
        }
    );

    document.getElementById('courses-pagination').addEventListener(
        'click',
        e => {
            e.preventDefault();
            if (e.target.tagName === 'A') {
                const page = e.target.dataset.page;
                const totalPages = Math.ceil(
                    filteredCourses.length / coursesPerPage
                );

                if (page === 'prev' && currentCoursePage > 1) {
                    currentCoursePage--;
                } else if (
                    page === 'next' &&
                    currentCoursePage < totalPages
                ) {
                    currentCoursePage++;
                } else if (page !== 'prev' && page !== 'next') {
                    currentCoursePage = parseInt(page);
                }

                displayCourses();
            }
        }
    );

    document.getElementById('course-search-name').addEventListener(
        'input',
        filterCourses
    );

    document.getElementById('course-search-level').addEventListener(
        'change',
        filterCourses
    );

    document.getElementById('course-search-language').addEventListener(
        'change',
        filterCourses
    );

    function filterCourses() {
        const name = document.getElementById(
            'course-search-name'
        ).value.toLowerCase();
        const level = document.getElementById(
            'course-search-level'
        ).value;
        const language = document.getElementById(
            'course-search-language'
        ).value;

        filteredCourses = allCourses.filter(course => {
            const matchName = course.name.toLowerCase().includes(
                name
            );
            const matchLevel = !level || course.level === level;
            const matchLanguage = !language ||
                course.name.toLowerCase().includes(
                    language.toLowerCase()
                );
            return matchName && matchLevel && matchLanguage;
        });

        currentCoursePage = 1;
        displayCourses();
    }

    document.getElementById(
        'tutor-search-qualification'
    ).addEventListener('change', filterTutors);

    document.getElementById(
        'tutor-search-experience'
    ).addEventListener('input', filterTutors);

    document.getElementById(
        'tutor-search-language'
    ).addEventListener('change', filterTutors);

    function filterTutors() {
        const qualification = document.getElementById(
            'tutor-search-qualification'
        ).value;
        const experience = parseInt(
            document.getElementById(
                'tutor-search-experience'
            ).value
        ) || 0;
        const language = document.getElementById(
            'tutor-search-language'
        ).value;

        filteredTutors = allTutors.filter(tutor => {
            const matchQual = !qualification ||
                tutor.language_level === qualification;
            const matchExp = tutor.work_experience >= experience;
            const matchLang = !language ||
                tutor.languages_offered.includes(language);
            return matchQual && matchExp && matchLang;
        });

        displayTutors();
    }

    document.getElementById(
        'course-enrollment-form'
    ).addEventListener('submit', async e => {
        e.preventDefault();
        await submitCourseEnrollment();
    });

    document.getElementById('tutor-request-form').addEventListener(
        'submit',
        async e => {
            e.preventDefault();
            await submitTutorRequest();
        }
    );

    document.getElementById('course-start-date').addEventListener(
        'change',
        updateTimeOptions
    );

    const costInputs = [
        'course-start-time',
        'students-number',
        'opt-supplementary',
        'opt-personalized',
        'opt-excursions',
        'opt-assessment',
        'opt-interactive'
    ];

    costInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', calculateCourseCost);
        }
    });
}

async function openCourseModal(courseId) {
    selectedCourse = allCourses.find(c => c.id === courseId);
    if (!selectedCourse) {
        return;
    }

    document.getElementById('course-name').value = selectedCourse.name;
    document.getElementById('course-teacher').value =
        selectedCourse.teacher;

    const dateSelect = document.getElementById('course-start-date');
    dateSelect.innerHTML = '<option value="">Выберите дату</option>';

    selectedCourse.start_dates.forEach(dateTime => {
        const date = dateTime.split('T')[0];
        if (!Array.from(dateSelect.options).find(
            opt => opt.value === date
        )) {
            const option = document.createElement('option');
            option.value = date;
            option.textContent = new Date(date).toLocaleDateString(
                'ru-RU'
            );
            dateSelect.appendChild(option);
        }
    });

    document.getElementById('course-start-time').disabled = true;
    document.getElementById('course-start-time').innerHTML =
        '<option value="">Сначала выберите дату</option>';
    document.getElementById('students-number').value = 1;
    document.getElementById('total-cost').textContent = '0';

    ['opt-supplementary', 'opt-personalized', 'opt-excursions',
        'opt-assessment', 'opt-interactive'].forEach(id => {
        document.getElementById(id).checked = false;
    });

    const modal = new bootstrap.Modal(
        document.getElementById('courseModal')
    );
    modal.show();
}

function updateTimeOptions() {
    const selectedDate = document.getElementById(
        'course-start-date'
    ).value;
    const timeSelect = document.getElementById('course-start-time');

    if (!selectedDate) {
        timeSelect.disabled = true;
        timeSelect.innerHTML =
            '<option value="">Сначала выберите дату</option>';
        return;
    }

    timeSelect.innerHTML = '<option value="">Выберите время</option>';
    timeSelect.disabled = false;

    const matchingDates = selectedCourse.start_dates.filter(dt =>
        dt.startsWith(selectedDate)
    );

    matchingDates.forEach(dateTime => {
        const time = dateTime.split('T')[1];
        const [hours] = time.split(':');
        const startHour = parseInt(hours);
        const endHour = startHour + selectedCourse.week_length;

        const option = document.createElement('option');
        option.value = time;
        option.textContent = `${time} - ${
            String(endHour).padStart(2, '0')
        }:00`;
        timeSelect.appendChild(option);
    });

    const durationText = `${selectedCourse.total_length} недель, ` +
        `последнее занятие: ${calculateEndDate(selectedDate)}`;
    document.getElementById('course-duration').value = durationText;

    calculateCourseCost();
}

function calculateEndDate(startDate) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (selectedCourse.total_length * 7));
    return date.toLocaleDateString('ru-RU');
}

function calculateCourseCost() {
    if (!selectedCourse) {
        return;
    }

    const timeValue = document.getElementById(
        'course-start-time'
    ).value;
    if (!timeValue) {
        document.getElementById('total-cost').textContent = '0';
        return;
    }

    const dateValue = document.getElementById(
        'course-start-date'
    ).value;
    const studentsNumber = parseInt(
        document.getElementById('students-number').value
    ) || 1;

    const [hours] = timeValue.split(':');
    const startHour = parseInt(hours);

    const courseFeePerHour = selectedCourse.course_fee_per_hour;
    const durationInHours = selectedCourse.total_length *
        selectedCourse.week_length;

    const dayOfWeek = new Date(dateValue).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekendMultiplier = isWeekend ? 1.5 : 1;

    let morningSurcharge = 0;
    if (startHour >= 9 && startHour < 12) {
        morningSurcharge = 400;
    }

    let eveningSurcharge = 0;
    if (startHour >= 18 && startHour < 20) {
        eveningSurcharge = 1000;
    }

    let baseCost = (
        (courseFeePerHour * durationInHours * weekendMultiplier) +
        morningSurcharge + eveningSurcharge
    ) * studentsNumber;

    const discountInfo = document.getElementById('discount-info');
    discountInfo.innerHTML = '';

    const today = new Date();
    const startDate = new Date(dateValue);
    const daysDiff = Math.floor(
        (startDate - today) / (1000 * 60 * 60 * 24)
    );
    let earlyRegistration = false;
    if (daysDiff >= 30) {
        earlyRegistration = true;
        baseCost *= 0.9;
        discountInfo.innerHTML +=
            '<span class="discount-badge">' +
            'Скидка за раннюю регистрацию: -10%</span>';
    }

    let groupEnrollment = false;
    if (studentsNumber >= 5) {
        groupEnrollment = true;
        baseCost *= 0.85;
        discountInfo.innerHTML +=
            '<span class="discount-badge">' +
            'Скидка за групповую запись: -15%</span>';
    }

    let intensiveCourse = false;
    if (selectedCourse.week_length >= 5) {
        intensiveCourse = true;
        baseCost *= 1.2;
        discountInfo.innerHTML +=
            '<span class="surcharge-badge">' +
            'Интенсивный курс: +20%</span>';
    }

    const supplementary = document.getElementById(
        'opt-supplementary'
    ).checked;
    if (supplementary) {
        baseCost += 2000 * studentsNumber;
    }

    const personalized = document.getElementById(
        'opt-personalized'
    ).checked;
    if (personalized) {
        baseCost += 1500 * selectedCourse.total_length;
    }

    const excursions = document.getElementById(
        'opt-excursions'
    ).checked;
    if (excursions) {
        baseCost *= 1.25;
    }

    const assessment = document.getElementById(
        'opt-assessment'
    ).checked;
    if (assessment) {
        baseCost += 300;
    }

    const interactive = document.getElementById(
        'opt-interactive'
    ).checked;
    if (interactive) {
        baseCost *= 1.5;
    }

    document.getElementById('total-cost').textContent =
        Math.round(baseCost);
}

async function submitCourseEnrollment() {
    const dateStart = document.getElementById(
        'course-start-date'
    ).value;
    const timeStart = document.getElementById(
        'course-start-time'
    ).value;
    const persons = parseInt(
        document.getElementById('students-number').value
    );
    const price = parseInt(
        document.getElementById('total-cost').textContent
    );

    const today = new Date();
    const startDate = new Date(dateStart);
    const daysDiff = Math.floor(
        (startDate - today) / (1000 * 60 * 60 * 24)
    );
    const earlyRegistration = daysDiff >= 30;
    const groupEnrollment = persons >= 5;
    const intensiveCourse = selectedCourse.week_length >= 5;

    const orderData = {
        course_id: selectedCourse.id,
        date_start: dateStart,
        time_start: timeStart,
        duration: selectedCourse.total_length *
            selectedCourse.week_length,
        persons: persons,
        price: price,
        early_registration: earlyRegistration,
        group_enrollment: groupEnrollment,
        intensive_course: intensiveCourse,
        supplementary: document.getElementById(
            'opt-supplementary'
        ).checked,
        personalized: document.getElementById(
            'opt-personalized'
        ).checked,
        excursions: document.getElementById(
            'opt-excursions'
        ).checked,
        assessment: document.getElementById(
            'opt-assessment'
        ).checked,
        interactive: document.getElementById(
            'opt-interactive'
        ).checked
    };

    try {
        await api.createOrder(orderData);
        showNotification('Заявка успешно создана!', 'success');
        bootstrap.Modal.getInstance(
            document.getElementById('courseModal')
        ).hide();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function openTutorModal(tutorId) {
    selectedTutor = allTutors.find(t => t.id === tutorId);
    if (!selectedTutor) {
        return;
    }

    document.getElementById('tutor-name-display').value =
        selectedTutor.name;
    document.getElementById('student-name').value = '';
    document.getElementById('student-email').value = '';
    document.getElementById('tutor-date').value = '';
    document.getElementById('tutor-time').value = '';
    document.getElementById('tutor-duration').value = 1;
    document.getElementById('student-message').value = '';

    const modal = new bootstrap.Modal(
        document.getElementById('tutorModal')
    );
    modal.show();
}

async function submitTutorRequest() {
    const dateStart = document.getElementById('tutor-date').value;
    const timeStart = document.getElementById('tutor-time').value;
    const duration = parseInt(
        document.getElementById('tutor-duration').value
    );

    const price = selectedTutor.price_per_hour * duration;

    const orderData = {
        tutor_id: selectedTutor.id,
        date_start: dateStart,
        time_start: timeStart,
        duration: duration,
        persons: 1,
        price: price,
        early_registration: false,
        group_enrollment: false,
        intensive_course: false,
        supplementary: false,
        personalized: false,
        excursions: false,
        assessment: false,
        interactive: false
    };

    try {
        await api.createOrder(orderData);
        showNotification(
            'Заявка на занятие с репетитором создана!',
            'success'
        );
        bootstrap.Modal.getInstance(
            document.getElementById('tutorModal')
        ).hide();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

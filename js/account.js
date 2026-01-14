let allOrders = [];
let currentPage = 1;
const ordersPerPage = 5;
let orderToDelete = null;
let orderToEdit = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadOrders();
    setupEventListeners();
});

async function loadOrders() {
    try {
        allOrders = await api.getOrders();
        displayOrders();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function displayOrders() {
    const ordersList = document.getElementById('orders-list');
    const start = (currentPage - 1) * ordersPerPage;
    const end = start + ordersPerPage;
    const ordersToDisplay = allOrders.slice(start, end);

    ordersList.innerHTML = '';

    if (ordersToDisplay.length === 0) {
        ordersList.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    У вас пока нет заявок
                </td>
            </tr>
        `;
        return;
    }

    ordersToDisplay.forEach(async order => {
        const row = document.createElement('tr');
        let courseName = 'Загрузка...';

        try {
            if (order.course_id) {
                const course = await api.getCourse(order.course_id);
                courseName = course.name;
            } else if (order.tutor_id) {
                courseName = 'Занятие с репетитором';
            }
        } catch (error) {
            courseName = 'Неизвестно';
        }

        row.innerHTML = `
            <td>${order.id}</td>
            <td>${courseName}</td>
            <td>${new Date(order.date_start).toLocaleDateString(
        'ru-RU'
    )}</td>
            <td>${order.price} руб.</td>
            <td class="table-actions">
                <button 
                    class="btn btn-info btn-sm" 
                    data-order-id="${order.id}"
                    data-action="details"
                >
                    Подробнее
                </button>
                <button 
                    class="btn btn-warning btn-sm" 
                    data-order-id="${order.id}"
                    data-action="edit"
                >
                    Изменить
                </button>
                <button 
                    class="btn btn-danger btn-sm" 
                    data-order-id="${order.id}"
                    data-action="delete"
                >
                    Удалить
                </button>
            </td>
        `;
        ordersList.appendChild(row);
    });

    displayPagination();
}

function displayPagination() {
    const pagination = document.getElementById('orders-pagination');
    const totalPages = Math.ceil(allOrders.length / ordersPerPage);

    pagination.innerHTML = '';

    if (totalPages <= 1) {
        return;
    }

    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${
        currentPage === 1 ? 'disabled' : ''
    }`;
    prevLi.innerHTML = `
        <a class="page-link" href="#" data-page="prev">Предыдущая</a>
    `;
    pagination.appendChild(prevLi);

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${
            i === currentPage ? 'active' : ''
        }`;
        li.innerHTML = `
            <a class="page-link" href="#" data-page="${i}">${i}</a>
        `;
        pagination.appendChild(li);
    }

    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${
        currentPage === totalPages ? 'disabled' : ''
    }`;
    nextLi.innerHTML = `
        <a class="page-link" href="#" data-page="next">Следующая</a>
    `;
    pagination.appendChild(nextLi);
}

function setupEventListeners() {
    document.getElementById('orders-list').addEventListener(
        'click',
        async e => {
            const btn = e.target.closest('button');
            if (!btn) {
                return;
            }

            const orderId = parseInt(btn.dataset.orderId);
            const action = btn.dataset.action;

            switch (action) {
            case 'details':
                await showOrderDetails(orderId);
                break;
            case 'edit':
                await openEditModal(orderId);
                break;
            case 'delete':
                openDeleteModal(orderId);
                break;
            }
        }
    );

    document.getElementById('orders-pagination').addEventListener(
        'click',
        e => {
            e.preventDefault();
            if (e.target.tagName === 'A') {
                const page = e.target.dataset.page;
                const totalPages = Math.ceil(
                    allOrders.length / ordersPerPage
                );

                if (page === 'prev' && currentPage > 1) {
                    currentPage--;
                } else if (
                    page === 'next' &&
                    currentPage < totalPages
                ) {
                    currentPage++;
                } else if (page !== 'prev' && page !== 'next') {
                    currentPage = parseInt(page);
                }

                displayOrders();
            }
        }
    );

    document.getElementById('edit-order-form').addEventListener(
        'submit',
        async e => {
            e.preventDefault();
            await submitEditOrder();
        }
    );

    document.getElementById('confirm-delete-btn').addEventListener(
        'click',
        async () => {
            await deleteOrder();
        }
    );
}

async function showOrderDetails(orderId) {
    try {
        const order = await api.getOrder(orderId);
        const content = document.getElementById(
            'order-details-content'
        );

        let courseName = 'Неизвестно';
        let description = '';

        if (order.course_id) {
            try {
                const course = await api.getCourse(order.course_id);
                courseName = course.name;
                description = course.description;
            } catch (error) {
                courseName = 'Ошибка загрузки';
            }
        } else if (order.tutor_id) {
            courseName = 'Занятие с репетитором';
        }

        let optionsHtml = '<ul class="list-unstyled">';
        if (order.early_registration) {
            optionsHtml +=
                '<li>✓ Ранняя регистрация (скидка 10%)</li>';
        }
        if (order.group_enrollment) {
            optionsHtml +=
                '<li>✓ Групповая запись (скидка 15%)</li>';
        }
        if (order.intensive_course) {
            optionsHtml += '<li>✓ Интенсивный курс (+20%)</li>';
        }
        if (order.supplementary) {
            optionsHtml +=
                '<li>✓ Дополнительные материалы</li>';
        }
        if (order.personalized) {
            optionsHtml += '<li>✓ Индивидуальные занятия</li>';
        }
        if (order.excursions) {
            optionsHtml += '<li>✓ Культурные экскурсии</li>';
        }
        if (order.assessment) {
            optionsHtml += '<li>✓ Оценка уровня владения</li>';
        }
        if (order.interactive) {
            optionsHtml += '<li>✓ Интерактивная платформа</li>';
        }
        optionsHtml += '</ul>';

        content.innerHTML = `
            <p><strong>Номер заказа:</strong> ${order.id}</p>
            <p><strong>Курс:</strong> ${courseName}</p>
            ${description ? `<p><strong>Описание:</strong> 
            ${description}</p>` : ''}
            <p><strong>Дата начала:</strong> ${
    new Date(order.date_start).toLocaleDateString('ru-RU')
}</p>
            <p><strong>Время:</strong> ${order.time_start}</p>
            <p><strong>Продолжительность:</strong> ${
    order.duration
} часов</p>
            <p><strong>Количество студентов:</strong> ${
    order.persons
}</p>
            <p><strong>Дополнительные опции:</strong></p>
            ${optionsHtml}
            <p><strong>Общая стоимость:</strong> ${
    order.price
} руб.</p>
        `;

        const modal = new bootstrap.Modal(
            document.getElementById('orderDetailsModal')
        );
        modal.show();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function openEditModal(orderId) {
    try {
        orderToEdit = await api.getOrder(orderId);

        document.getElementById('edit-date').value =
            orderToEdit.date_start;
        document.getElementById('edit-time').value =
            orderToEdit.time_start;
        document.getElementById('edit-persons').value =
            orderToEdit.persons;
        document.getElementById('edit-supplementary').checked =
            orderToEdit.supplementary || false;
        document.getElementById('edit-personalized').checked =
            orderToEdit.personalized || false;
        document.getElementById('edit-excursions').checked =
            orderToEdit.excursions || false;
        document.getElementById('edit-assessment').checked =
            orderToEdit.assessment || false;
        document.getElementById('edit-interactive').checked =
            orderToEdit.interactive || false;

        const modal = new bootstrap.Modal(
            document.getElementById('editOrderModal')
        );
        modal.show();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function submitEditOrder() {
    const updatedData = {
        date_start: document.getElementById('edit-date').value,
        time_start: document.getElementById('edit-time').value,
        persons: parseInt(
            document.getElementById('edit-persons').value
        ),
        supplementary: document.getElementById(
            'edit-supplementary'
        ).checked,
        personalized: document.getElementById(
            'edit-personalized'
        ).checked,
        excursions: document.getElementById(
            'edit-excursions'
        ).checked,
        assessment: document.getElementById(
            'edit-assessment'
        ).checked,
        interactive: document.getElementById(
            'edit-interactive'
        ).checked
    };

    try {
        await api.updateOrder(orderToEdit.id, updatedData);
        showNotification('Заявка успешно обновлена!', 'success');
        bootstrap.Modal.getInstance(
            document.getElementById('editOrderModal')
        ).hide();
        await loadOrders();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function openDeleteModal(orderId) {
    orderToDelete = orderId;
    const modal = new bootstrap.Modal(
        document.getElementById('deleteOrderModal')
    );
    modal.show();
}

async function deleteOrder() {
    try {
        await api.deleteOrder(orderToDelete);
        showNotification('Заявка успешно удалена!', 'success');
        bootstrap.Modal.getInstance(
            document.getElementById('deleteOrderModal')
        ).hide();
        await loadOrders();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

const API_BASE_URL =
    'http://exam-api-courses.std-900.ist.mospolytech.ru';
const API_KEY = '07f773ee-4431-467d-87c3-3fb93dfc96a7';

const api = {
    async getCourses() {
        const response = await fetch(
            `${API_BASE_URL}/api/courses?api_key=${API_KEY}`
        );
        if (!response.ok) {
            throw new Error('Ошибка загрузки курсов');
        }
        return await response.json();
    },

    async getTutors() {
        const response = await fetch(
            `${API_BASE_URL}/api/tutors?api_key=${API_KEY}`
        );
        if (!response.ok) {
            throw new Error('Ошибка загрузки репетиторов');
        }
        return await response.json();
    },

    async getOrders() {
        const response = await fetch(
            `${API_BASE_URL}/api/orders?api_key=${API_KEY}`
        );
        if (!response.ok) {
            throw new Error('Ошибка загрузки заявок');
        }
        return await response.json();
    },

    async getOrder(orderId) {
        const response = await fetch(
            `${API_BASE_URL}/api/orders/${orderId}?api_key=${API_KEY}`
        );
        if (!response.ok) {
            throw new Error('Ошибка загрузки заявки');
        }
        return await response.json();
    },

    async getCourse(courseId) {
        const response = await fetch(
            `${API_BASE_URL}/api/courses/${courseId}?api_key=${API_KEY}`
        );
        if (!response.ok) {
            throw new Error('Ошибка загрузки курса');
        }
        return await response.json();
    },

    async createOrder(orderData) {
        const response = await fetch(
            `${API_BASE_URL}/api/orders?api_key=${API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            }
        );
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Ошибка создания заявки');
        }
        return await response.json();
    },

    async updateOrder(orderId, orderData) {
        const response = await fetch(
            `${API_BASE_URL}/api/orders/${orderId}?api_key=${API_KEY}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            }
        );
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Ошибка обновления заявки');
        }
        return await response.json();
    },

    async deleteOrder(orderId) {
        const response = await fetch(
            `${API_BASE_URL}/api/orders/${orderId}?api_key=${API_KEY}`,
            {
                method: 'DELETE'
            }
        );
        if (!response.ok) {
            throw new Error('Ошибка удаления заявки');
        }
        return await response.json();
    }
};

function showNotification(message, type = 'success') {
    const notificationArea = document.getElementById('notification-area');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notificationArea.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

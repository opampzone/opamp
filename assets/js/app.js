document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    // Проверяем ширину экрана
    const isDesktop = window.innerWidth > 768;
    
    if (isDesktop) {
        const menuState = localStorage.getItem('menuOpenDesktop');
        if (menuState === null || menuState === 'true') {
            sidebar.classList.add('open');
        }
    } else {
        sidebar.classList.remove('open');
    }

    // Клик по бургеру
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        if (window.innerWidth > 768) {
            localStorage.setItem('menuOpenDesktop', sidebar.classList.contains('open'));
        }
    });

    // --- УПРАВЛЕНИЕ АККОРДЕОНОМ ---
    const categories = document.querySelectorAll('.category-title');
    
    // 1. Подсвечиваем активную статью в меню (сравниваем текущий URL с href ссылки)
    const currentPath = window.location.pathname;
    const fileItems = document.querySelectorAll('.file-item');
    
    fileItems.forEach(item => {
        const itemPath = item.getAttribute('href');
        // Если текущий адрес заканчивается на путь ссылки (например, /opamp/ и content/opamp/)
        if (currentPath.includes(itemPath)) {
            item.classList.add('active');
            // Автоматически открываем рубрику, в которой находится эта статья
            const parentList = item.closest('.file-list');
            if (parentList) {
                parentList.classList.add('show');
                parentList.previousElementSibling.classList.add('active');
            }
        }
    });

    // 2. Восстанавливаем состояние аккордеона (если пользователь просто открыл главную)
    if (currentPath.endsWith('/') || currentPath.endsWith('index.html')) {
        const openCategory = localStorage.getItem('openCategory');
        if (openCategory) {
            const cat = document.querySelector(`[data-category="${openCategory}"]`);
            if (cat) {
                cat.classList.add('active');
                cat.nextElementSibling.classList.add('show');
            }
        }
    }

    // 3. Клик по рубрикам
    categories.forEach(cat => {
        cat.addEventListener('click', () => {
            const catId = cat.getAttribute('data-category');
            const fileList = cat.nextElementSibling;
            const isCurrentlyActive = cat.classList.contains('active');

            categories.forEach(c => {
                c.classList.remove('active');
                c.nextElementSibling.classList.remove('show');
            });

            if (!isCurrentlyActive) {
                cat.classList.add('active');
                fileList.classList.add('show');
                localStorage.setItem('openCategory', catId);
            } else {
                localStorage.removeItem('openCategory');
            }
        });
    });
});

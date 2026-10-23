document.addEventListener('DOMContentLoaded', () => {
    // 0. Логика работы бургер-меню
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    // Проверяем ширину экрана
    const isDesktop = window.innerWidth > 768;
    
    if (isDesktop) {
        // НА КОМПЬЮТЕРЕ: смотрим в память браузера.
        // Если там ничего нет (первый визит) или сохранено "true" — открываем.
        const menuState = localStorage.getItem('menuOpenDesktop');
        if (menuState === null || menuState === 'true') {
            sidebar.classList.add('open');
        }
    } else {
        // НА МОБИЛЬНОМ: принудительно убираем класс "open", чтобы меню было скрыто!
        sidebar.classList.remove('open');
    }

    // Клик по кнопке
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        // Запоминаем состояние ТОЛЬКО для компьютера
        if (window.innerWidth > 768) {
            localStorage.setItem('menuOpenDesktop', sidebar.classList.contains('open'));
        }
    });

    // --- НАЧАЛО АККОРДЕОНА И СТАТЕЙ ---
    const categories = document.querySelectorAll('.category-title');
    const fileItems = document.querySelectorAll('.file-item');
    const contentArea = document.querySelector('.article-container');

    // 1. Восстанавливаем состояние аккордеона (только одну открытую рубрику)
    const openCategory = localStorage.getItem('openCategory');
    if (openCategory) {
        const cat = document.querySelector(`[data-category="${openCategory}"]`);
        if (cat) {
            cat.classList.add('active');
            cat.nextElementSibling.classList.add('show');
        }
    }

    // 2. Логика аккордеона (открыта только одна рубрика)
    categories.forEach(cat => {
        cat.addEventListener('click', () => {
            const catId = cat.getAttribute('data-category');
            const fileList = cat.nextElementSibling;
            const isCurrentlyActive = cat.classList.contains('active');

            // Сначала принудительно закрываем ВСЕ рубрики и скрываем их списки
            categories.forEach(c => {
                c.classList.remove('active');
                c.nextElementSibling.classList.remove('show');
            });

            // Если кликнутая рубрика не была открыта, открываем её
            if (!isCurrentlyActive) {
                cat.classList.add('active');
                fileList.classList.add('show');
                localStorage.setItem('openCategory', catId);
            } else {
                // Если кликнули на уже открытую — она просто закроется, очищаем память
                localStorage.removeItem('openCategory');
            }
        });
    });

    // 3. АЯКС-ЗАГРУЗКА СТАТЕЙ
    fileItems.forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            
             // --- СРАЗУ ЗАКРЫВАЕМ МЕНЮ НА МОБИЛЬНОМ ---
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
            // ------------------------------------------

            let url = item.getAttribute('href');
            
            // Принудительно убираем слэш в начале (защита от старых кэшей)
            if (url.startsWith('/')) {
                url = url.substring(1);
            }
            
            fileItems.forEach(el => el.classList.remove('active'));
            item.classList.add('active');

            contentArea.innerHTML = '<p style="color: #666; font-style: italic;">Загрузка статьи...</p>';

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP ошибка: ${response.status}`);
                const html = await response.text();
                
                // Проверка на страницу 404 от GitHub
                if (html.includes('<title>Page not found</title>')) {
                    throw new Error('Файл не найден на сервере (404)');
                }

                contentArea.innerHTML = html;

                // --- МАГИЯ ДЛЯ КАРТИНОК ---
                // Автоматически подставляем пути к картинкам из папки img рубрики
                const images = contentArea.querySelectorAll('img');
                const urlParts = url.split('/');
                const categoryName = urlParts[1]; // Получаем название рубрики

                images.forEach(img => {
                    const src = img.getAttribute('src');
                    // Если путь относительный и не начинается с http или слэша
                    if (src && !src.startsWith('http') && !src.startsWith('/')) {
                        img.src = `content/${categoryName}/${src}`;
                    }
                });
                // ---------------------------

                document.title = item.textContent + ' | OpAmp-Zone';
                window.scrollTo(0, 0);

                // Если мы на мобильном телефоне — автоматически закрываем меню после выбора статьи
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('open');
                }

            } catch (error) {
                console.error('Ошибка:', error);
                contentArea.innerHTML = `<div style="color:#721c24; background-color:#f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px;">
                    <h3>Ошибка загрузки статьи</h3>
                    <p><b>Причина:</b> ${error.message}</p>
                    <p><b>Пытались загрузить:</b> <code>${url}</code></p>
                    <p><b>Проверьте, существует ли этот файл в репозитории.</b></p>
                </div>`;
            }
        });
    });
});
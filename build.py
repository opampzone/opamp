import os
import shutil

CONTENT_DIR = 'content'
OUTPUT_DIR = 'public'
TEMPLATE_FILE = 'index_template.html'

# Список папок, которые не должны попадать в меню
IGNORE_DIRS = ['Архив', 'Секретные_файлы', 'backup', '.git']

def clean_name(name):
    name = os.path.splitext(name)[0]
    name = name.replace('_', ' ')
    return name

def generate_menu():
    menu_html = ""
    if not os.path.exists(CONTENT_DIR):
        return "<p>Папка content пуста</p>"

    categories = []
    for d in os.listdir(CONTENT_DIR):
        d_path = os.path.join(CONTENT_DIR, d)
        if os.path.isdir(d_path):
            if d in IGNORE_DIRS or "img" in d.lower() or d.lower() == "js":
                continue
            categories.append(d)
    
    categories.sort()

    for cat in categories:
        cat_path = os.path.join(CONTENT_DIR, cat)
        cat_name = clean_name(cat)
        
        menu_html += f'''
        <div class="category-title" data-category="{cat}">
            <span>📁 {cat_name}</span>
            <span class="arrow">▼</span>
        </div>
        <div class="file-list">
        '''
        
        files = sorted([f for f in os.listdir(cat_path) if f.endswith('.html') or f.endswith('.md')])
        for file in files:
            file_name = clean_name(file)
            # Генерируем ссылку на готовую страницу. Путь относительный!
            file_link = f"content/{cat}/{file}" 
            menu_html += f'<a href="{file_link}" class="file-item">{file_name}</a>\n'
        
        menu_html += '</div>'

    return menu_html

def build():
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)
    os.makedirs(OUTPUT_DIR)

    # Копируем стили и скрипты
    shutil.copytree('assets', os.path.join(OUTPUT_DIR, 'assets'))

    # Читаем шаблон один раз
    with open(TEMPLATE_FILE, 'r', encoding='utf-8') as f:
        template = f.read()

    menu_html = generate_menu()

    # --- ГЕНЕРАЦИЯ СТАТЕЙ ---
    for cat in os.listdir(CONTENT_DIR):
        cat_path = os.path.join(CONTENT_DIR, cat)
        if not os.path.isdir(cat_path) or "img" in cat.lower() or cat.lower() == "js":
            continue

        # Создаем папку для рубрики в итоговой директории
        output_cat_path = os.path.join(OUTPUT_DIR, 'content', cat)
        os.makedirs(output_cat_path, exist_ok=True)

        for file in os.listdir(cat_path):
            if file.endswith('.html') or file.endswith('.md'):
                file_path = os.path.join(cat_path, file)
                file_name = clean_name(file)
                
                # Читаем текст статьи
                with open(file_path, 'r', encoding='utf-8') as f:
                    article_content = f.read()

                # Вставляем статью и заголовок в шаблон
                page_html = template.replace('<!-- MENU_PLACEHOLDER -->', menu_html)
                page_html = page_html.replace('<!-- ARTICLE_CONTENT -->', article_content)
                page_html = page_html.replace('<!-- PAGE_TITLE -->', file_name)

                # Сохраняем готовую страницу
                output_file_path = os.path.join(output_cat_path, file)
                with open(output_file_path, 'w', encoding='utf-8') as f:
                    f.write(page_html)
        
        # Копируем картинки, если они есть в папке img
        if os.path.exists(os.path.join(cat_path, 'img')):
            shutil.copytree(os.path.join(cat_path, 'img'), os.path.join(output_cat_path, 'img'))

    # --- ГЕНЕРАЦИЯ ГЛАВНОЙ СТРАНИЦЫ ---
    index_html = template.replace('<!-- MENU_PLACEHOLDER -->', menu_html)
    index_html = index_html.replace('<!-- ARTICLE_CONTENT -->', '<h1>Добро пожаловать!</h1><p>Выберите статью в меню.</p>')
    index_html = index_html.replace('<!-- PAGE_TITLE -->', 'База знаний')
    
    with open(os.path.join(OUTPUT_DIR, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(index_html)

    print("✅ Сборка завершена! Все страницы сгенерированы.")

if __name__ == '__main__':
    build()

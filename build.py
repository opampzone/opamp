# В коде ниже я объединил два правила:
# Умный фильтр: любые папки, где есть слово img (в любом регистре) или папка js, пропускаются автоматически.
# Ручной список: список IGNORE_DIRS, куда вы сможете вписать любые другие папки (на русском или английском), которые нужно скрыть.


import os
import shutil

CONTENT_DIR = 'content'
OUTPUT_DIR = 'public'
TEMPLATE_FILE = 'index_template.html'
OUTPUT_INDEX = os.path.join(OUTPUT_DIR, 'index.html')

# --- РУЧНЫЕ ИСКЛЮЧЕНИЯ ---
# Впишите сюда названия папок, которые НЕ нужно показывать в меню (в точности как они называются в репозитории)
IGNORE_DIRS = [
    'Архив', 
    'Секретные_файлы',
    'backup',
    '.git'
]

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
            # 1. Если папка в ручном списке исключений — пропускаем
            if d in IGNORE_DIRS:
                continue
            # 2. Если в названии есть "img" (в любом регистре) или это "js" — пропускаем
            if "img" in d.lower() or d.lower() == "js":
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
        
        files = sorted([
            f for f in os.listdir(cat_path) 
            if f.endswith('.html') or f.endswith('.md')
        ])
        
        for file in files:
            file_name = clean_name(file)
            file_link = f"content/{cat}/{file}"
            menu_html += f'<a href="{file_link}" class="file-item">{file_name}</a>\n'
        
        menu_html += '</div>'

    return menu_html

def build():
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)
    os.makedirs(OUTPUT_DIR)

    shutil.copytree('assets', os.path.join(OUTPUT_DIR, 'assets'))
    shutil.copytree(CONTENT_DIR, os.path.join(OUTPUT_DIR, 'content'))

    with open(TEMPLATE_FILE, 'r', encoding='utf-8') as f:
        template = f.read()

    menu_html = generate_menu()
    final_html = template.replace('<!-- MENU_PLACEHOLDER -->', menu_html)

    with open(OUTPUT_INDEX, 'w', encoding='utf-8') as f:
        f.write(final_html)

    print("✅ Сборка завершена! Меню сгенерировано.")

if __name__ == '__main__':
    build()
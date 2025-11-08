import re

# SearchPage - add dark mode classes to form elements
search_page_path = r'C:\Users\hkcha\OneDrive\Desktop\PDF_EXCEL_CONVERT_APP\frontend\src\pages\SearchPage.jsx'

with open(search_page_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix line 122 - search input
content = content.replace(
    'className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"',
    'className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"'
)

# Fix select elements (vendor, city, state) - add dark mode
content = re.sub(
    r'(<select[^>]*className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500)"',
    r'\1 dark:bg-gray-700 dark:text-white"',
    content
)

# Fix other input elements (circuit_id, start/end dates, amounts)
content = re.sub(
    r'(<input[^>]*type="(?:text|date|number)"[^>]*className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500)"',
    r'\1 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"',
    content
)

# Fix labels
content = re.sub(
    r'(<label className="block text-sm font-medium text-gray-700)(">)',
    r'\1 dark:text-gray-200\2',
    content
)

# Fix duplicate dark:border-gray-700
content = content.replace('dark:border-gray-700 dark:border-gray-700', 'dark:border-gray-700')

with open(search_page_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed SearchPage.jsx")

# ComparisonPage - fix malformed className
comparison_page_path = r'C:\Users\hkcha\OneDrive\Desktop\PDF_EXCEL_CONVERT_APP\frontend\src\pages\ComparisonPage.jsx'

with open(comparison_page_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix malformed className on line 124
pattern = r'className=\s*dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-primary-400 dark:focus:border-primary-400"([^"]*)"'
replacement = r'className="\1 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-primary-400 dark:focus:border-primary-400"'

content = re.sub(pattern, replacement, content)

with open(comparison_page_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed ComparisonPage.jsx")

# SchedulerPage - fix malformed classNames
scheduler_page_path = r'C:\Users\hkcha\OneDrive\Desktop\PDF_EXCEL_CONVERT_APP\frontend\src\pages\SchedulerPage.jsx'

with open(scheduler_page_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix all malformed classNames
pattern = r'className=\s*dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-primary-400 dark:focus:border-primary-400"([^"]*)"'
replacement = r'className="\1 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"'

content = re.sub(pattern, replacement, content)

# Fix labels
content = re.sub(
    r'(<label className="block text-xs font-medium text-gray-600)(">)',
    r'\1 dark:text-gray-300\2',
    content
)

with open(scheduler_page_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed SchedulerPage.jsx")

print("\n" + "="*60)
print("All remaining form elements have been fixed!")
print("="*60)

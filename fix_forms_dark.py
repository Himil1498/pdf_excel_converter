import os
import re

def fix_form_elements(filepath):
    """Fix all form elements to have proper dark mode classes"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Fix input fields - look for className patterns
        # Pattern 1: Input with focus:ring-primary-500
        content = re.sub(
            r'(className="[^"]*px-\d+[^"]*py-\d+[^"]*border[^"]*focus:ring-primary-500[^"]*)"',
            lambda m: m.group(1).replace('"', ' dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-primary-400 dark:focus:border-primary-400"') if 'dark:bg' not in m.group(1) else m.group(0),
            content
        )

        # Pattern 2: Select elements
        content = re.sub(
            r'(<select[^>]*className="[^"]*)(w-full[^"]*px-\d+[^"]*py-\d+[^"]*border[^"]*rounded[^"]*)"',
            lambda m: m.group(1) + m.group(2).replace('"', ' dark:bg-gray-700 dark:text-white dark:border-gray-600"') if 'dark:bg' not in m.group(0) else m.group(0),
            content
        )

        # Pattern 3: Textarea elements
        content = re.sub(
            r'(<textarea[^>]*className="[^"]*)(w-full[^"]*border[^"]*rounded[^"]*)"',
            lambda m: m.group(1) + m.group(2).replace('"', ' dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"') if 'dark:bg' not in m.group(0) else m.group(0),
            content
        )

        # Pattern 4: Generic input/select/textarea that might have been missed
        content = re.sub(
            r'(className="[^"]*border[^"]*border-gray-300[^"]*rounded[^"]*px-\d+[^"]*py-\d+[^"]*)"',
            lambda m: m.group(1).replace('"', ' dark:bg-gray-700 dark:text-white dark:border-gray-600"') if 'dark:bg' not in m.group(1) and 'button' not in m.group(1).lower() else m.group(0),
            content
        )

        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False

    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

# Process all files
base_path = r'C:\Users\hkcha\OneDrive\Desktop\PDF_EXCEL_CONVERT_APP\frontend\src'
files_updated = []

for root, dirs, files in os.walk(base_path):
    for file in files:
        if file.endswith('.jsx'):
            filepath = os.path.join(root, file)
            if fix_form_elements(filepath):
                files_updated.append(file)

print("=" * 60)
print("FORM ELEMENTS DARK MODE FIX")
print("=" * 60)
print(f"\nFiles with form elements updated: {len(files_updated)}")
for f in sorted(files_updated):
    print(f"  ✓ {f}")
print("\n" + "=" * 60)

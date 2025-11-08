import os
import re

def fix_malformed_classnames(filepath):
    """Fix malformed className attributes that have dark: classes at the start"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Pattern to match malformed className with dark: at the start
        # Example: className= dark:bg-gray-700 dark:text-white"w-full px-4...
        pattern = r'className=\s*dark:[^"]*"([^"]*)"'

        def fix_match(match):
            # Get the full match
            full_match = match.group(0)
            # Extract the content after the first quote
            content_after_quote = match.group(1)

            # Extract dark mode classes (everything before the closing quote of dark: section)
            dark_classes = full_match.split('"')[0].replace('className=', '').strip()

            # The main classes come after the malformed part
            main_classes = content_after_quote

            # Rebuild properly: className="main-classes dark:classes"
            return f'className="{main_classes} {dark_classes}"'

        # Apply the fix
        content = re.sub(pattern, fix_match, content)

        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False

    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

# Process specific files with known issues
files_to_fix = [
    r'C:\Users\hkcha\OneDrive\Desktop\PDF_EXCEL_CONVERT_APP\frontend\src\components\CustomFieldModal.jsx',
]

print("=" * 60)
print("FIXING MALFORMED CLASSNAMES")
print("=" * 60)
files_updated = []

for filepath in files_to_fix:
    if os.path.exists(filepath):
        if fix_malformed_classnames(filepath):
            files_updated.append(os.path.basename(filepath))
            print(f"✓ Fixed: {os.path.basename(filepath)}")
    else:
        print(f"✗ Not found: {filepath}")

print("\n" + "=" * 60)
print(f"Total files fixed: {len(files_updated)}")
print("=" * 60)

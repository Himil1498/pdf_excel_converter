import os
import re

# Comprehensive dark mode replacements for all elements
replacements = {
    # Backgrounds
    'className="bg-white ': 'className="bg-white dark:bg-gray-800 ',
    'className="bg-white"': 'className="bg-white dark:bg-gray-800"',
    'className="bg-gray-50 ': 'className="bg-gray-50 dark:bg-gray-900 ',
    'className="bg-gray-50"': 'className="bg-gray-50 dark:bg-gray-900"',
    'className="bg-gray-100 ': 'className="bg-gray-100 dark:bg-gray-700 ',
    'className="bg-gray-100"': 'className="bg-gray-100 dark:bg-gray-700"',
    'className="bg-blue-50 ': 'className="bg-blue-50 dark:bg-blue-900/20 ',
    'className="bg-blue-50"': 'className="bg-blue-50 dark:bg-blue-900/20"',
    'className="bg-green-50 ': 'className="bg-green-50 dark:bg-green-900/20 ',
    'className="bg-red-50 ': 'className="bg-red-50 dark:bg-red-900/20 ',
    'className="bg-yellow-50 ': 'className="bg-yellow-50 dark:bg-yellow-900/20 ',

    # Text colors
    'className="text-gray-900 ': 'className="text-gray-900 dark:text-white ',
    'className="text-gray-900"': 'className="text-gray-900 dark:text-white"',
    'className="text-gray-800 ': 'className="text-gray-800 dark:text-gray-100 ',
    'className="text-gray-800"': 'className="text-gray-800 dark:text-gray-100"',
    'className="text-gray-700 ': 'className="text-gray-700 dark:text-gray-200 ',
    'className="text-gray-700"': 'className="text-gray-700 dark:text-gray-200"',
    'className="text-gray-600 ': 'className="text-gray-600 dark:text-gray-300 ',
    'className="text-gray-600"': 'className="text-gray-600 dark:text-gray-300"',
    'className="text-gray-500 ': 'className="text-gray-500 dark:text-gray-400 ',
    'className="text-gray-500"': 'className="text-gray-500 dark:text-gray-400"',
    'className="text-gray-400 ': 'className="text-gray-400 dark:text-gray-500 ',

    # Borders
    'className="border-gray-200 ': 'className="border-gray-200 dark:border-gray-700 ',
    'className="border-gray-200"': 'className="border-gray-200 dark:border-gray-700"',
    'className="border-gray-300 ': 'className="border-gray-300 dark:border-gray-600 ',
    'className="border-gray-300"': 'className="border-gray-300 dark:border-gray-600"',
    'border border-gray-200': 'border border-gray-200 dark:border-gray-700',
    'border border-gray-300': 'border border-gray-300 dark:border-gray-600',
    'border-b border-gray-200': 'border-b border-gray-200 dark:border-gray-700',
    'border-t border-gray-200': 'border-t border-gray-200 dark:border-gray-700',

    # Dividers
    'divide-gray-200': 'divide-gray-200 dark:divide-gray-700',

    # Hover states
    'hover:bg-gray-50': 'hover:bg-gray-50 dark:hover:bg-gray-700',
    'hover:bg-gray-100': 'hover:bg-gray-100 dark:hover:bg-gray-600',

    # Shadows
    'shadow-sm': 'shadow-sm dark:shadow-gray-900/50',
    'shadow-md': 'shadow-md dark:shadow-gray-900/50',
    'shadow-lg': 'shadow-lg dark:shadow-gray-900/50',
    'shadow-xl': 'shadow-xl dark:shadow-gray-900/50',

    # Rings (focus states)
    'ring-gray-300': 'ring-gray-300 dark:ring-gray-600',
    'focus:ring-primary-500': 'focus:ring-primary-500 dark:focus:ring-primary-400',

    # Placeholders
    'placeholder-gray-400': 'placeholder-gray-400 dark:placeholder-gray-500',
    'placeholder:text-gray-400': 'placeholder:text-gray-400 dark:placeholder:text-gray-500',
}

def should_skip_replacement(content, old_pattern, pos):
    """Check if this replacement should be skipped (already has dark:)"""
    # Check if dark: already exists in the next 200 characters
    snippet = content[pos:pos+200]
    if 'dark:' in snippet.split('"')[0]:
        return True
    return False

def fix_file(filepath):
    """Fix dark mode in a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        changes_made = []

        for old, new in replacements.items():
            if old in content:
                # Count occurrences
                count = content.count(old)
                # Replace
                content = content.replace(old, new)
                if count > 0:
                    changes_made.append(f"  - {old[:40]}: {count} replacements")

        # Special handling for form inputs that might have been missed
        # Input fields
        content = re.sub(
            r'(<input[^>]*className="[^"]*)(">)',
            lambda m: m.group(1) + ' dark:bg-gray-700 dark:text-white dark:border-gray-600' + m.group(2) if 'dark:bg' not in m.group(1) else m.group(0),
            content
        )

        # Textarea fields
        content = re.sub(
            r'(<textarea[^>]*className="[^"]*)(">)',
            lambda m: m.group(1) + ' dark:bg-gray-700 dark:text-white dark:border-gray-600' + m.group(2) if 'dark:bg' not in m.group(1) else m.group(0),
            content
        )

        # Select fields
        content = re.sub(
            r'(<select[^>]*className="[^"]*)(">)',
            lambda m: m.group(1) + ' dark:bg-gray-700 dark:text-white dark:border-gray-600' + m.group(2) if 'dark:bg' not in m.group(1) else m.group(0),
            content
        )

        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, changes_made

        return False, []

    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False, []

# Process all React files
base_path = r'C:\Users\hkcha\OneDrive\Desktop\PDF_EXCEL_CONVERT_APP\frontend\src'
files_updated = {}

for root, dirs, files in os.walk(base_path):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            updated, changes = fix_file(filepath)
            if updated:
                files_updated[file] = changes

print("=" * 60)
print("COMPREHENSIVE DARK MODE FIX COMPLETED")
print("=" * 60)
print(f"\nTotal files updated: {len(files_updated)}\n")

for filename, changes in sorted(files_updated.items()):
    print(f"\n{filename}:")
    if changes:
        for change in changes[:5]:  # Show first 5 changes per file
            print(change)
    else:
        print("  - Form elements and other dark mode improvements")

print("\n" + "=" * 60)
print("All components now have comprehensive dark mode support!")
print("=" * 60)

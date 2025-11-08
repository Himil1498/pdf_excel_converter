search_page_path = r'C:\Users\hkcha\OneDrive\Desktop\PDF_EXCEL_CONVERT_APP\frontend\src\pages\SearchPage.jsx'

with open(search_page_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix all labels (lines 163, 178, 193, 205, 215, 226, 237)
content = content.replace(
    '<label className="block text-sm font-medium text-gray-700 mb-2">',
    '<label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">'
)

# Fix search input (line 122)
content = content.replace(
    'className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"',
    'className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"'
)

# Fix City select (line 164-173)
content = content.replace(
    '''                  <select
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >''',
    '''                  <select
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >'''
)

# Fix State select (line 179-188)
content = content.replace(
    '''                  <select
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >''',
    '''                  <select
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >'''
)

# Fix Circuit ID input (line 194-200)
content = content.replace(
    '''                  <input
                    type="text"
                    value={filters.circuit_id}
                    onChange={(e) => handleFilterChange('circuit_id', e.target.value)}
                    placeholder="e.g., CKT123456"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />''',
    '''                  <input
                    type="text"
                    value={filters.circuit_id}
                    onChange={(e) => handleFilterChange('circuit_id', e.target.value)}
                    placeholder="e.g., CKT123456"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  />'''
)

# Fix Start Date input (line 206-211)
content = content.replace(
    '''                  <input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />''',
    '''                  <input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />'''
)

# Fix End Date input (line 216-221)
content = content.replace(
    '''                  <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />''',
    '''                  <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />'''
)

# Fix Min Amount input (line 227-233)
content = content.replace(
    '''                  <input
                    type="number"
                    value={filters.min_amount}
                    onChange={(e) => handleFilterChange('min_amount', e.target.value)}
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />''',
    '''                  <input
                    type="number"
                    value={filters.min_amount}
                    onChange={(e) => handleFilterChange('min_amount', e.target.value)}
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  />'''
)

# Fix Max Amount input (line 238-244)
content = content.replace(
    '''                  <input
                    type="number"
                    value={filters.max_amount}
                    onChange={(e) => handleFilterChange('max_amount', e.target.value)}
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />''',
    '''                  <input
                    type="number"
                    value={filters.max_amount}
                    onChange={(e) => handleFilterChange('max_amount', e.target.value)}
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  />'''
)

# Fix duplicate dark:border-gray-700
content = content.replace('dark:border-gray-700 dark:border-gray-700', 'dark:border-gray-700')

with open(search_page_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed SearchPage.jsx - All form elements now have proper dark mode classes!")

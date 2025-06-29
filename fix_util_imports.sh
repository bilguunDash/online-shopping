#!/bin/bash

# Fix imports in components subdirectories - utils imports
find src/components/layout src/components/admin src/components/products src/components/categories src/components/pages src/components/common -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../utils/|from "../../utils/|g'

# Also fix axios imports with single quotes
find src/components/layout src/components/admin src/components/products src/components/categories src/components/pages src/components/common -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i "s|from '../utils/|from '../../utils/|g"

echo "Utils imports fixed successfully!" 
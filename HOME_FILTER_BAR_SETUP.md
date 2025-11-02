# Home Page Filter Bar Setup Guide

This guide explains how to add the home page filter bar that redirects users to the collection page with selected filters.

## Files Created

1. **`public/snippets/home-filter-bar.liquid`** - The home page filter bar component

## Features

- **Date Picker**: Calendar date selection
- **Time Picker**: Dropdown for selecting time slots
- **City Picker**: Dropdown for selecting cities
- **Search Button**: Redirects to collection page with filters applied
- **URL Parameters**: Filters are passed as URL parameters
- **Auto-Apply**: Collection page automatically applies filters from URL

## Installation Instructions

### Step 1: Add the Filter Bar to Your Home Page

You need to add this snippet to your home page. Here are a few ways to do it:

#### Option A: Through Shopify Theme Customizer

1. Go to **Online Store → Themes → Customize**
2. Go to **Sections** in the left sidebar
3. Add a new **Custom HTML** section
4. Add the following code:

```liquid
{% render 'home-filter-bar' %}
```

#### Option B: Edit Template Files

If you have access to your theme files, add this line to your home page template (usually `templates/index.liquid`):

```liquid
{% render 'home-filter-bar' %}
```

### Step 2: Update Collection Handles

In the `home-filter-bar.liquid` file, update the collection handle:

```javascript
// Line 65 in public/snippets/home-filter-bar.liquid
const collectionHandle = 'all'; // Change this to your actual collection handle
```

Common collection handles:
- `all` - All products
- `birthday-centers` - If you have a specific collection
- Your custom collection handle

### Step 3: Update API URL

Make sure the API URL in the snippet matches your current setup:

```javascript
// Line 163 in public/snippets/home-filter-bar.liquid
const HOME_FILTER_APP_URL = 'https://32f54c2a17ce.ngrok-free.app';
```

Update this with:
- Your ngrok URL (for development)
- Your production URL (when deployed)
- Your local development URL

### Step 4: Ensure Collection Filters are Added

The collection filters automatically read URL parameters and apply them. Make sure you have:

1. The collection-filters snippet on your collection page
2. The collection page template includes the snippet

## How It Works

### Flow

1. **User on Home Page**:
   - User selects date, time, and city from the filter bar
   - User clicks "Search" button

2. **Redirect to Collection**:
   - User is redirected to collection page
   - URL includes parameters: `?date=2024-01-15&time=10:00&city=New York`

3. **Collection Page**:
   - JavaScript reads URL parameters
   - Filters are automatically applied
   - Products are filtered based on selections

### Code Flow

```javascript
// Home Page Filter Bar
User selects filters → Click Search → 
Redirect to: /collections/all?date=2024-01-15&time=10:00&city=New York

// Collection Page
Page loads → JavaScript reads URL parameters → 
Set activeFilters → applyFilters() → 
Products are filtered
```

## Customization

### Design Customization

Edit the `<style>` section in `home-filter-bar.liquid`:

```css
/* Change gradient colors */
.home-filter-bar {
  background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}

/* Change button color */
.filter-search-btn {
  background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}
```

### Add More Filters

To add more filter options:

1. Add the filter item in HTML:
```html
<div class="filter-item">
  <label for="home-filter-custom" class="filter-label">Custom Filter</label>
  <select id="home-filter-custom" name="custom" class="filter-select">
    <option value="">Select Option</option>
  </select>
</div>
```

2. Add to redirect function:
```javascript
function redirectToCollectionWithFilters() {
  const custom = document.getElementById('home-filter-custom').value;
  
  // Add to filters array
  if (custom) filters.push(`custom=${encodeURIComponent(custom)}`);
  
  // ... rest of the code
}
```

3. Update collection-filters.liquid to read the new parameter.

## Testing

### Test the Filter Bar

1. Go to your home page
2. Select a date, time, and city
3. Click "Search"
4. Verify you're redirected to the collection page
5. Check URL contains the filter parameters
6. Verify products are filtered correctly

### Test URL Direct Access

Try accessing the collection page directly with filters:

```
https://yourstore.com/collections/all?date=2024-01-15&time=10:00&city=New York
```

Products should be filtered based on these parameters.

## Troubleshooting

### Filters Not Loading

**Problem**: Dropdowns are empty
**Solution**: Check browser console for API errors. Verify:
- API URL is correct
- API endpoint is accessible
- Server is running

### Redirect Not Working

**Problem**: Clicking Search doesn't redirect
**Solution**: Check browser console for JavaScript errors. Verify:
- Collection handle is correct
- JavaScript errors are not blocking execution

### Filters Not Applied on Collection

**Problem**: Products not filtered on collection page
**Solution**: 
1. Check URL parameters are present
2. Check browser console for errors
3. Verify collection-filters.liquid is included on page
4. Check `loadFiltersFromURL()` function is executing

## Advanced: Store Selected Filters

You can store user's filter preferences in localStorage:

```javascript
// Store filters
function storeFilters() {
  const filters = {
    date: document.getElementById('home-filter-date').value,
    time: document.getElementById('home-filter-time').value,
    city: document.getElementById('home-filter-city').value
  };
  localStorage.setItem('lastFilters', JSON.stringify(filters));
}

// Load stored filters
function loadStoredFilters() {
  const stored = localStorage.getItem('lastFilters');
  if (stored) {
    const filters = JSON.parse(stored);
    document.getElementById('home-filter-date').value = filters.date || '';
    document.getElementById('home-filter-time').value = filters.time || '';
    document.getElementById('home-filter-city').value = filters.city || '';
  }
}
```

## Next Steps

1. **Customize the design** to match your brand
2. **Add more filter options** if needed
3. **Test thoroughly** across different scenarios
4. **Monitor performance** and optimize if needed

## Support

If you encounter any issues:
1. Check browser console for errors
2. Verify all files are properly uploaded
3. Check API endpoints are accessible
4. Test with sample data


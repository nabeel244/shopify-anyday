# Banner Filter Installation Guide

## What I Created

I created a new banner section that includes the filter bar: **`image-banner-with-filter.liquid`**

This is the same as the original banner section, but with the filter bar added at the top.

## How to Use It

### Option 1: Use the New Section (Recommended)

1. Go to your Shopify admin
2. Navigate to **Online Store → Themes → Customize**
3. Go to the page where you want to add the banner
4. Click **Add section**
5. Look for **"Image banner with Filter"**
6. Add it to your page
7. Enable the **"Show filter bar"** option

### Option 2: Add Filter to Existing Section

If you want to add the filter bar to your existing banner section, simply add this line at the top:

```liquid
{% render 'home-filter-bar' %}
```

Add it after the CSS styles and before the banner div:

```liquid
{{ 'section-image-banner.css' | asset_url | stylesheet_tag }}

{%- if section.settings.image_height == 'adapt' and section.settings.image != blank -%}
  {%- style -%}
    ...
  {%- endstyle -%}
{%- endif -%}

{%- comment -%} ADD THIS LINE {%- endcomment -%}
{% render 'home-filter-bar' %}

<div id="Banner-{{ section.id }}" class="banner..."a>
  ...
</div>
```

## Where Filter Shows

The filter bar appears **above the banner**, with the gradient background matching your design.

## Configuration

### Toggle Filter On/Off

In the section settings, you'll find a checkbox:
- **"Show filter bar"** - Enable/disable the filter bar

### Customize Appearance

You can modify the filter bar design by editing:
- **File**: `public/snippets/home-filter-bar.liquid`
- Edit the CSS in the `<style>` section (lines 165-294)

## Design Notes

The filter bar:
- Has a gradient background (purple to blue)
- White rounded container with filters inside
- Fully responsive (mobile-friendly)
- Matches the Georgian design you shared

## Test It

1. Add the banner section to your home page
2. You should see the filter bar at the top
3. Fill in Date, Time, and City
4. Click "Search"
5. You should be redirected to the collection page with filters applied

## Troubleshooting

### Filter bar not showing?
- Make sure **"Show filter bar"** is enabled in section settings
- Check that `home-filter-bar.liquid` snippet exists in your theme

### Filters not working?
- Verify API URL is correct in `home-filter-bar.liquid` (line 50)
- Check browser console for errors
- Ensure `/api/collection-filters` endpoint is accessible

### Styling issues?
- Check for CSS conflicts
- Verify responsive styles are loading
- Test on different screen sizes



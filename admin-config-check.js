// Admin Configuration Check Script
// Copy and paste this into your browser console on the admin panel

console.log('🔍 ADMIN CONFIGURATION CHECK');

function checkAdminConfiguration() {
  console.log('🔍 Checking admin configuration for available days...');
  
  // Look for the available days checkboxes in the admin form
  const availableDaysCheckboxes = document.querySelectorAll('input[type="checkbox"][name*="availableDays"], input[type="checkbox"][value*="monday"], input[type="checkbox"][value*="tuesday"]');
  
  console.log(`Found ${availableDaysCheckboxes.length} day checkboxes`);
  
  if (availableDaysCheckboxes.length === 0) {
    console.log('🔍 Trying alternative selectors...');
    
    // Try other possible selectors
    const altCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    console.log(`Found ${altCheckboxes.length} total checkboxes`);
    
    // Look for checkboxes with day-related values
    const dayCheckboxes = Array.from(altCheckboxes).filter(cb => {
      const value = cb.value.toLowerCase();
      return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(value);
    });
    
    console.log(`Found ${dayCheckboxes.length} day-related checkboxes:`, dayCheckboxes.map(cb => ({
      value: cb.value,
      checked: cb.checked,
      name: cb.name
    })));
    
    return dayCheckboxes;
  }
  
  return availableDaysCheckboxes;
}

function fixAdminConfiguration() {
  console.log('🔧 Attempting to fix admin configuration...');
  
  const dayCheckboxes = checkAdminConfiguration();
  
  if (dayCheckboxes.length === 0) {
    console.error('❌ No day checkboxes found. Please manually check your admin form.');
    return;
  }
  
  // Expected days: Monday through Saturday
  const expectedDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  console.log('🔧 Setting up all required days...');
  
  expectedDays.forEach(expectedDay => {
    const checkbox = dayCheckboxes.find(cb => cb.value.toLowerCase() === expectedDay);
    
    if (checkbox) {
      if (!checkbox.checked) {
        console.log(`✅ Checking ${expectedDay}`);
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        console.log(`✅ ${expectedDay} already checked`);
      }
    } else {
      console.error(`❌ Checkbox for ${expectedDay} not found`);
    }
  });
  
  console.log('🔧 Configuration updated! Please save the configuration.');
}

function showAdminInstructions() {
  console.log(`
🎯 ADMIN CONFIGURATION INSTRUCTIONS

If the automatic fix didn't work, please manually:

1. Go to your Shopify app admin panel
2. Navigate to "Product Booking Configuration" 
3. Find the product you're testing
4. Click "Edit" 
5. Scroll to "Available Days" section
6. Make sure these days are CHECKED:
   ✅ Monday
   ✅ Tuesday  
   ✅ Wednesday
   ✅ Thursday
   ✅ Friday
   ✅ Saturday
7. Click "Update Configuration"
8. Refresh your product page

The API should then return all 6 days instead of just 3.
`);
}

// Run the check
const dayCheckboxes = checkAdminConfiguration();

if (dayCheckboxes.length > 0) {
  fixAdminConfiguration();
} else {
  showAdminInstructions();
}

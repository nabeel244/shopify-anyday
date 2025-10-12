// Calendar Debug Script - Copy this into your browser console

console.log('🔍 CALENDAR DEBUG SCRIPT');

function debugCalendarIssue() {
  console.log('🔍 Step 1: Checking calendar elements...');
  
  const calendar = document.getElementById('customCalendar');
  const calendarGrid = document.getElementById('calendarGrid');
  const monthYear = document.getElementById('calendarMonthYear');
  const prevButton = document.getElementById('prevMonth');
  const nextButton = document.getElementById('nextMonth');
  
  console.log('Elements found:', {
    calendar: !!calendar,
    calendarGrid: !!calendarGrid,
    monthYear: !!monthYear,
    prevButton: !!prevButton,
    nextButton: !!nextButton
  });
  
  if (!calendarGrid) {
    console.error('❌ Calendar grid not found - this is the problem!');
    return;
  }
  
  console.log('🔍 Step 2: Checking calendar content...');
  console.log('Calendar grid innerHTML length:', calendarGrid.innerHTML.length);
  console.log('Calendar grid children count:', calendarGrid.children.length);
  
  if (calendarGrid.innerHTML.length === 0) {
    console.error('❌ Calendar grid is empty - rendering failed');
    
    console.log('🔍 Step 3: Trying to render calendar manually...');
    
    // Try to call renderCalendar manually
    if (typeof renderCalendar === 'function') {
      console.log('renderCalendar function exists, calling it...');
      try {
        renderCalendar(2025, 9); // October 2025
        console.log('✅ Manual render call completed');
      } catch (error) {
        console.error('❌ Error in manual render:', error);
      }
    } else {
      console.error('❌ renderCalendar function not found');
    }
    
    // Wait and check again
    setTimeout(() => {
      console.log('🔍 Step 4: Checking after manual render...');
      console.log('Calendar grid innerHTML length:', calendarGrid.innerHTML.length);
      
      if (calendarGrid.innerHTML.length === 0) {
        console.log('🔍 Creating fallback calendar...');
        createFallbackCalendar();
      }
    }, 500);
  } else {
    console.log('✅ Calendar has content, checking structure...');
    
    const weekdays = calendarGrid.querySelector('.calendar-weekdays');
    const days = calendarGrid.querySelector('.calendar-days');
    
    console.log('Calendar structure:', {
      hasWeekdays: !!weekdays,
      hasDays: !!days,
      weekdayCount: weekdays ? weekdays.children.length : 0,
      dayCount: days ? days.children.length : 0
    });
  }
}

function createFallbackCalendar() {
  console.log('🔧 Creating fallback calendar...');
  
  const calendarGrid = document.getElementById('calendarGrid');
  if (!calendarGrid) return;
  
  calendarGrid.innerHTML = `
    <div class="calendar-weekdays">
      <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
    </div>
    <div class="calendar-days">
      <div class="calendar-day empty"></div>
      <div class="calendar-day empty"></div>
      <div class="calendar-day empty"></div>
      <div class="calendar-day empty"></div>
      <div class="calendar-day empty"></div>
      <div class="calendar-day available" onclick="selectDate('2025-10-01')" title="Available">1</div>
      <div class="calendar-day available" onclick="selectDate('2025-10-02')" title="Available">2</div>
      <div class="calendar-day available" onclick="selectDate('2025-10-03')" title="Available">3</div>
      <div class="calendar-day available" onclick="selectDate('2025-10-04')" title="Available">4</div>
      <div class="calendar-day disabled" title="Disabled">5</div>
      <div class="calendar-day available" onclick="selectDate('2025-10-06')" title="Available">6</div>
      <div class="calendar-day available" onclick="selectDate('2025-10-07')" title="Available">7</div>
      <div class="calendar-day available" onclick="selectDate('2025-10-08')" title="Available">8</div>
      <div class="calendar-day available" onclick="selectDate('2025-10-09')" title="Available">9</div>
      <div class="calendar-day available" onclick="selectDate('2025-10-10')" title="Available">10</div>
      <div class="calendar-day available" onclick="selectDate('2025-10-11')" title="Available">11</div>
      <div class="calendar-day available" onclick="selectDate('2025-10-12')" title="Available">12</div>
      <div class="calendar-day disabled" title="Disabled">13</div>
      <div class="calendar-day available" onclick="selectDate('2025-10-14')" title="Available">14</div>
      <div class="calendar-day available" onclick="selectDate('2025-10-15')" title="Available">15</div>
      <div class="calendar-day available" onclick="selectDate('2025-10-16')" title="Available">16</div>
      <div class="calendar-day available" onclick="selectDate('2025-10-17')" title="Available">17</div>
      <div class="calendar-day available" onclick="selectDate('2025-10-18')" title="Available">18</div>
      <div class="calendar-day available" onclick="selectDate('2025-10-19')" title="Available">19</div>
      <div class="calendar-day available" onclick="selectDate('2025-10-20')" title="Available">20</div>
      <div class="calendar-day disabled" title="Disabled">21</div>
      <div class="calendar-day available" onclick="selectDate('2025-10-22')" title="Available">22</div>
      <div class="calendar-day available" onclick="selectDate('2025-10-23')" title="Available">23</div>
      <div class="calendar-day available" onclick="selectDate('2025-10-24')" title="Available">24</div>
      <div class="calendar-day available" onclick="selectDate('2025-10-25')" title="Available">25</div>
      <div class="calendar-day available" onclick="selectDate('2025-10-26')" title="Available">26</div>
      <div class="calendar-day available" onclick="selectDate('2025-10-27')" title="Available">27</div>
      <div class="calendar-day available" onclick="selectDate('2025-10-28')" title="Available">28</div>
      <div class="calendar-day disabled" title="Disabled">29</div>
      <div class="calendar-day available" onclick="selectDate('2025-10-30')" title="Available">30</div>
      <div class="calendar-day available" onclick="selectDate('2025-10-31')" title="Available">31</div>
    </div>
  `;
  
  console.log('✅ Fallback calendar created with October 2025 days');
}

// Run the debug
debugCalendarIssue();

console.log(`
🎯 CALENDAR DEBUG COMPLETE

This script will:
1. Check if calendar elements exist
2. Verify calendar content
3. Try manual rendering if needed
4. Create fallback calendar if all else fails

Expected result: Calendar should show October 2025 with proper day styling
`);

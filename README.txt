jQuery DateSpanPicker
=====================

This plugin is meant to offer a date span widget similar to the widget used in
Google's Calendar application.

Requirements
---------------
jQuery 1.3.2 (maybe not, but haven't tested with other versions)
jQuery.date_input.js: http://jonathanleighton.com/projects/date-input

Features
---------------
* Calendar widget using jQuery.date_input.js for selecting a date.
* Select time in 30 minute intervals
* End date/time automatically adjusted when the start date/time adjusted to
 maintain a consistent interval.
** End date/time not adjusted if less than start date/time
* If end date and start date are the same (day), end time selector requires the
 end time to be greater than the start time, and displays the difference.
* "All day" checkbox hides the start/end time.

Usage
---------------
Note: The included stylesheet pretties it up, but shouldn't be strictly
required. That said, it will look like junk if you don't use any. ;D

Given this HTML (style and script tags not shown):

<div id="picker">

  <input type="text" class="picker-start-date" name="start_date" />
  <input type="text" class="picker-start-time" name="start_time" />

  <input type="text" class="picker-end-date" name="end_date" />
  <input type="text" class="picker-end-time" name="end_time" />

  <input type="checkbox" id="all_day" name="all_day" />
  <label for="all_day">All day</label>

</div>

You can apply the plugin like this: $( '#picker' ).dateSpanPicker()

Issues
---------------
* Need to autocorrect bad entries
* Create elements if they don't exist (optional?)
* Better style for time picker
* jquery.date_input.js should allow custom classes


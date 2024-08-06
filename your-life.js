/**
 * Interactive form and chart events / logic.
 */
(function () {
  var yearEl = document.getElementById('year'),
    monthEl = document.getElementById('month'),
    dayEl = document.getElementById('day'),
    unitboxEl = document.getElementById('unitbox'),
    unitText = document.querySelector('.unitbox-label').textContent.toLowerCase(),
    items = document.querySelectorAll('.chart li'),
    itemCount,
    COLOR = document.getElementById('colorPicker'),
    KEY = {
      UP: 38,
      DOWN: 40
    };
  // Selecction
  const enableSelectionButton = document.getElementById('enableSelection');
  const colorSelectedButton = document.getElementById('colorSelected');
  const listItems = document.querySelectorAll('.chart li');
  let selectionEnabled = false;
  // Set listeners
  unitboxEl.addEventListener('change', _handleUnitChange);
  yearEl.addEventListener('input', _handleDateChange);
  yearEl.addEventListener('keydown', _handleUpdown);
  yearEl.addEventListener('blur', _unhideValidationStyles);
  monthEl.addEventListener('change', _handleDateChange);
  monthEl.addEventListener('keydown', _handleUpdown);
  dayEl.addEventListener('input', _handleDateChange);
  dayEl.addEventListener('blur', _unhideValidationStyles);
  dayEl.addEventListener('keydown', _handleUpdown);

  // Ensure the month is unselected by default.
  monthEl.selectedIndex = -1;

  // Load default values
  _loadStoredValueOfDOB();

  // Event Handlers
  function _handleUnitChange(e) {
    window.location = '' + e.currentTarget.value + '.html';
  }

  function _handleDateChange(e) {

    // Save date of birth in local storage
    localStorage.setItem("DOB", JSON.stringify({
      month: monthEl.value,
      year: yearEl.value,
      day: dayEl.value
    }));

    if (_dateIsValid()) {
      itemCount = calculateElapsedTime();
      _repaintItems(itemCount);
    } else {
      _repaintItems(0);
    }
  }

  function _handleUpdown(e) {
    var newNum;
    // A crossbrowser keycode option.
    thisKey = e.keyCode || e.which;
    if (e.target.checkValidity()) {
      if (thisKey === KEY.UP) {
        newNum = parseInt(e.target.value, 10);
        e.target.value = newNum += 1;
        // we call the date change function manually because the input event isn't
        // triggered by arrow keys, or by manually setting the value, as we've done.
        _handleDateChange();
      } else if (thisKey === KEY.DOWN) {
        newNum = parseInt(e.target.value, 10);
        e.target.value = newNum -= 1;
        _handleDateChange();
      }
    }
  }

  function _unhideValidationStyles(e) {
    e.target.classList.add('touched');
  }

  function calculateElapsedTime() {
    var currentDate = new Date(),
      dateOfBirth = _getDateOfBirth(),
      diff = currentDate.getTime() - dateOfBirth.getTime(),
      elapsedTime;

    switch (unitText) {
      case 'weeks':
        // Measuring weeks is tricky since our chart shows 52 weeks per year (for simplicity)
        // when the actual number of weeks per year is 52.143. Attempting to calculate weeks
        // with a diffing strategy will result in build-up over time. Instead, we'll add up
        // 52 per elapsed full year, and only diff the weeks on the current partial year.
        var elapsedYears = (new Date(diff).getUTCFullYear() - 1970);
        var isThisYearsBirthdayPassed = (currentDate.getTime() > new Date(currentDate.getUTCFullYear(), monthEl.value, dayEl.value).getTime());
        var birthdayYearOffset = isThisYearsBirthdayPassed ? 0 : 1;
        var dateOfLastBirthday = new Date(currentDate.getUTCFullYear() - birthdayYearOffset, monthEl.value, dayEl.value);
        var elapsedDaysSinceLastBirthday = Math.floor((currentDate.getTime() - dateOfLastBirthday.getTime()) / (1000 * 60 * 60 * 24));
        var elapsedWeeks = (elapsedYears * 52) + Math.floor(elapsedDaysSinceLastBirthday / 7);
        elapsedTime = elapsedWeeks;
        break;
      case 'months':
        // Months are tricky, being variable length, so I opted for the average number
        // of days in a month as a close-enough approximation (30.4375). This can make
        // the chart look off by a day when you're right on the month threshold, but
        // it's otherwise fairly accurate over long periods of time.
        elapsedTime = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.4375));
        break;
      case 'years':
        // We can represent our millisecond diff as a year and subtract 1970 to
        // end up with an accurate elapsed time. To see why, consider the following:
        //
        //   1. JavaScript's Date timestamp represents milliseconds since 1970. Thus,
        //      new Date(0).toUTCString() → 'Thu, 01 Jan 1970 00:00:00 GMT'
        //   2. Picture the diff between today and tomorrow. It's a small number. A
        //      newly created date with that number would result in January 2 1970.
        //   3. Thus, subtracting 1970 from that date gives us elapsed time. We use
        //      UTC because otherwise we'd need to offset "1970" by our timezone.
        //
        // See more details here: https://stackoverflow.com/a/24181701/1154642
        elapsedTime = (new Date(diff).getUTCFullYear() - 1970);
        break;
    }

    return elapsedTime;
  }

  function _dateIsValid() {
    return monthEl.checkValidity() && dayEl.checkValidity() && yearEl.checkValidity();
  }

  function _getDateOfBirth() {
    return new Date(yearEl.value, monthEl.value, dayEl.value);
  }

  function _repaintItems(number) {
    for (var i = 0; i < items.length; i++) {
      if (i < number) {
        items[i].style.backgroundColor = COLOR.value;
      } else {
        items[i].style.backgroundColor = '';
      }
    }
  }

  function _loadStoredValueOfDOB() {
    var DOB = JSON.parse(localStorage.getItem('DOB'));

    if (!DOB) {
      return;
    }

    if (DOB.month >= 0 && DOB.month < 12) {
      monthEl.value = DOB.month
    }

    if (DOB.year) {
      yearEl.value = DOB.year
    }

    if (DOB.day > 0 && DOB.day < 32) {
      dayEl.value = DOB.day
    }
    _handleDateChange();
  }

  // Selection
  enableSelectionButton.addEventListener('click', () => {
    selectionEnabled = !selectionEnabled;
    if (selectionEnabled) {
        enableSelectionButton.value = 'Deshabilitar Selección';
        colorSelectedButton.disabled = false;
        day.disabled = true;
        month.disabled = true;
        year.disabled = true;
        listItems.forEach(item => {
            item.classList.remove('disabled');
        });
    } else {
        enableSelectionButton.value = 'Habilitar Selección';
        colorSelectedButton.disabled = true;
        day.disabled = false;
        month.disabled = false;
        year.disabled = false;
        listItems.forEach(item => {
            item.classList.add('disabled');
        });
    }
  });

  listItems.forEach(item => {
      item.addEventListener('click', () => {
          if (selectionEnabled) {
            item.classList.toggle('selected');
            // Cambiar el color del borde
            if (item.classList.contains('selected')) {
              item.style.border = '1px solid blue'; 
              item.style.borderRadius = '50%';
            } else {
              item.style.border = '1px solid black';
              item.style.borderRadius = '0%';
            }
          }
      });
  });

  colorSelectedButton.addEventListener('click', () => {
      const selectedItems = document.querySelectorAll('.chart li.selected');
      selectedItems.forEach(item => {
          item.style.backgroundColor = COLOR.value;
          item.style.border = '1px solid black';
          item.style.borderRadius = '0%';
          item.classList.remove('selected');
      });
  });
})();

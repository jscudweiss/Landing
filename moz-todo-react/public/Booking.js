const state = {
    guests: 2,
    calYear: 0,
    calMonth: 0,
    selectedDate: null,
    selectedTime: null,
};

const TIMES = ['5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM',
    '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM'];
const UNAVAILABLE = ['7:00 PM', '8:00 PM']; // simulate some fully-booked slots
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_OPEN = [3, 4, 5, 6, 0]; // Wed=3, Thu=4, Fri=5, Sat=6, Sun=0

/* ── GUEST PICKER ── */
const guestDisplay = document.getElementById('guest-display');
const guestInput = document.getElementById('guests');
const guestLabel = document.getElementById('guest-label-text');

document.getElementById('guests-minus').addEventListener('click', () => {
    if (state.guests > 1) {
        state.guests--;
        guestDisplay.textContent = state.guests;
        guestInput.value = state.guests;
        guestLabel.textContent = state.guests === 1 ? 'guest' : 'guests';
    }
});
document.getElementById('guests-plus').addEventListener('click', () => {
    if (state.guests < 7) {
        state.guests++;
        guestDisplay.textContent = state.guests;
        guestInput.value = state.guests;
        guestLabel.textContent = state.guests === 1 ? 'guest' : 'guests';
    }
});

/* ── CALENDAR ── */
function initCalendar() {
    const now = new Date();
    state.calYear = now.getFullYear();
    state.calMonth = now.getMonth();
    renderCalendar();
}

function renderCalendar() {
    document.getElementById('cal-month-label').textContent =
        MONTHS[state.calMonth] + ' ' + state.calYear;

    const grid = document.getElementById('cal-grid');
    grid.innerHTML = '';

    const firstDay = new Date(state.calYear, state.calMonth, 1).getDay();
    const daysInMonth = new Date(state.calYear, state.calMonth + 1, 0).getDate();
    const today = new Date(); today.setHours(0, 0, 0, 0);

    for (let i = 0; i < firstDay; i++) {
        const blank = document.createElement('div');
        blank.className = 'cal-cell empty';
        grid.appendChild(blank);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'cal-cell';
        cell.textContent = d;

        const cellDate = new Date(state.calYear, state.calMonth, d);
        const dayOfWeek = cellDate.getDay();
        const isPast = cellDate < today;
        const isClosed = !DAYS_OPEN.includes(dayOfWeek);
        const isSelected = state.selectedDate &&
            state.selectedDate.getTime() === cellDate.getTime();

        if (isPast || isClosed) {
            cell.classList.add('disabled');
            cell.disabled = true;
        } else if (isSelected) {
            cell.classList.add('selected');
        }

        cell.addEventListener('click', () => selectDate(cellDate));
        grid.appendChild(cell);
    }
}

function selectDate(date) {
    state.selectedDate = date;
    state.selectedTime = null;
    document.getElementById('selected-date').value = date.toISOString();
    renderCalendar();
    renderTimeSlots(date);
    document.getElementById('time-field').style.display = 'block';
    document.getElementById('btn-to-3').disabled = true;
}

function renderTimeSlots(date) {
    const label = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    document.getElementById('time-date-display').textContent = label;

    const container = document.getElementById('time-slots');
    container.innerHTML = '';
    TIMES.forEach(t => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'time-slot';
        btn.textContent = t;
        if (UNAVAILABLE.includes(t)) {
            btn.classList.add('unavailable');
            btn.disabled = true;
        }
        btn.addEventListener('click', () => selectTime(t, btn));
        container.appendChild(btn);
    });
}

function selectTime(time, el) {
    document.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    state.selectedTime = time;
    document.getElementById('selected-time').value = time;
    document.getElementById('btn-to-3').disabled = false;
}

document.getElementById('cal-prev').addEventListener('click', () => {
    if (state.calMonth === 0) { state.calMonth = 11; state.calYear--; }
    else state.calMonth--;
    renderCalendar();
});
document.getElementById('cal-next').addEventListener('click', () => {
    if (state.calMonth === 11) { state.calMonth = 0; state.calYear++; }
    else state.calMonth++;
    renderCalendar();
});

function goTo(step) {
    document.querySelectorAll('.form-step').forEach(s => s.classList.add('hidden'));
    document.getElementById('step-' + step).classList.remove('hidden');

    document.querySelectorAll('.step').forEach((el, i) => {
        el.classList.toggle('active', i < step);
        el.classList.toggle('done', i < step - 1);
    });

    if (step === 3) buildConfirm();
}

function validateStep1() {
    const f = document.getElementById('fname').value.trim();
    const l = document.getElementById('lname').value.trim();
    const e = document.getElementById('email').value.trim();
    const p = document.getElementById('phone').value.trim();
    if (!f || !l) { alert('Please enter your full name.'); return false; }
    if (!e || !e.includes('@')) { alert('Please enter a valid email.'); return false; }
    if (!p) { alert('Please enter your phone number.'); return false; }
    return true;
}

document.getElementById('btn-to-2').addEventListener('click', () => {
    if (validateStep1()) goTo(2);
});
document.getElementById('btn-to-1').addEventListener('click', () => goTo(1));
document.getElementById('btn-to-3').addEventListener('click', () => goTo(3));
document.getElementById('btn-to-2b').addEventListener('click', () => goTo(2));

/* ── CONFIRM CARD ── */
function buildConfirm() {
    const dateStr = state.selectedDate
        ? state.selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : '—';
    const rows = [
        { label: 'Name', value: document.getElementById('fname').value + ' ' + document.getElementById('lname').value },
        { label: 'Date', value: dateStr },
        { label: 'Time', value: state.selectedTime || '—' },
        { label: 'Guests', value: state.guests + (state.guests === 1 ? ' guest' : ' guests') },
        { label: 'Email', value: document.getElementById('email').value },
    ];
    const occ = document.getElementById('occasion').value;
    if (occ) rows.push({ label: 'Occasion', value: occ.charAt(0).toUpperCase() + occ.slice(1) });

    ['confirm-rows', 'confirm-rows-success'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = rows.map(r =>
            `<div class="confirm-row">
            <span class="confirm-label">${r.label}</span>
            <span class="confirm-value">${r.value}</span>
          </div>`
        ).join('');
    });
}

document.getElementById('btn-submit').addEventListener('click', () => {
    const agreed = document.getElementById('terms').checked;
    if (!agreed) { alert('Please agree to the cancellation policy to proceed.'); return; }
    buildConfirm();
    document.getElementById('confirm-email-display').textContent =
        document.getElementById('email').value;
    document.querySelectorAll('.form-step').forEach(s => s.classList.add('hidden'));
    document.getElementById('step-success').classList.remove('hidden');
    document.querySelectorAll('.step').forEach(el => el.classList.add('done'));
});

initCalendar();
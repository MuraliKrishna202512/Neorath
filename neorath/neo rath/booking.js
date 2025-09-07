(function(){
	'use strict';

	const $ = (id) => document.getElementById(id);

	function getQueryParams(){
		const params = new URLSearchParams(window.location.search);
		return Object.fromEntries(params.entries());
	}

	function parsePriceFromText(text){
		// Accept formats like "$0.35/kWh" or "0.35"
		if(!text) return 0;
		const m = String(text).match(/[0-9]+(?:\.[0-9]+)?/);
		return m ? parseFloat(m[0]) : 0;
	}

	function formatCurrency(n){
		return `$${(n||0).toFixed(2)}`;
	}

	function computePrice({pricePerKwh, durationMinutes}){
		// Simple demo: assume average charge power 7kW; energy = power * hours
		const hours = (parseInt(durationMinutes||0,10) || 0) / 60;
		const powerKw = 7; // AC assumption for demo
		const energyKwh = powerKw * hours;
		return energyKwh * (parseFloat(pricePerKwh)||0);
	}

	document.addEventListener('DOMContentLoaded', () => {
		const q = getQueryParams();
		const stationName = q.station || 'Selected Station';
		const priceText = q.price || '0.35';
		const pricePerKwh = parsePriceFromText(priceText);

		$('station-name-input').value = stationName;
		$('station-badge').textContent = q.type ? q.type : 'Station';
		$('price-per-kwh').value = pricePerKwh.toFixed(2);

		// Default datetime: 30 mins from now
		const now = new Date();
		now.setMinutes(now.getMinutes() + 30);
		$('datetime').value = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}T${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

		function refreshEstimate(){
			const duration = $('duration').value;
			const ppk = parseFloat($('price-per-kwh').value) || 0;
			const price = computePrice({pricePerKwh: ppk, durationMinutes: duration});
			$('price-estimate').value = formatCurrency(price);
			$('summary-total').textContent = formatCurrency(price);

			const start = new Date($('datetime').value);
			const end = new Date(start.getTime() + (parseInt(duration,10)||0)*60000);
			const fmt = (d)=> `${d.toLocaleDateString()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
			$('summary-window').textContent = `${fmt(start)} - ${fmt(end)}`;
		}

		['duration','price-per-kwh','datetime'].forEach(id=> $(id).addEventListener('input', refreshEstimate));
		refreshEstimate();

		$('booking-form').addEventListener('submit', (e)=>{
			e.preventDefault();
			const booking = {
				id: Date.now().toString(),
				stationName: $('station-name-input').value,
				dateTime: $('datetime').value,
				duration: parseInt($('duration').value,10) || 0,
				vehicle: $('vehicle').value,
				status: 'confirmed',
				price: parseFloat(String($('price-estimate').value).replace(/[^0-9.]/g,'')) || 0
			};
			const key = 'intellicharge_bookings';
			const list = JSON.parse(localStorage.getItem(key) || '[]');
			list.push(booking);
			localStorage.setItem(key, JSON.stringify(list));

			const toast = $('success-toast');
			toast.style.display = 'flex';
			setTimeout(()=>{ toast.style.display = 'none'; window.location.href = 'index.html#bookings'; }, 1200);
		});
	});
})();


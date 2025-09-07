// IntelliCharge - Smart EV Charging Dashboard
class IntelliCharge {
    constructor() {
        console.log('IntelliCharge constructor called'); // Debug log
        this.map = null;
        this.currentPosition = null;
        this.chargingStations = [];
        this.markers = [];
        this.currentInfoWindow = null;
        this.activeFilter = 'all';
        this.currentBookingStation = null; // Add this property
        
        // Battery properties
        this.batteryCapacity = 75; // kWh
        this.batteryPercentage = 75; // %
        this.batteryEfficiency = 6.0; // km/kWh
        this.reserveBuffer = 10; // km reserve buffer
        
        this.init();
    }

    async init() {
        console.log('IntelliCharge init started'); // Debug log
        try {
            await this.initializeApp();
            this.setupEventListeners();
            this.updateBookingsSection();
            this.updateStats();
            this.updateBatteryGauge(); // Initialize battery gauge
            console.log('IntelliCharge init completed successfully'); // Debug log
        } catch (error) {
            console.error('Failed to initialize IntelliCharge:', error);
            this.showError('Failed to initialize the application. Please refresh the page.');
        }
    }

    async initializeApp() {
        console.log('initializeApp started'); // Debug log
        // Initialize Google Maps
        await this.initializeMap();
        console.log('Map initialized'); // Debug log
        
        // Get user's current location
        await this.getCurrentLocation();
        console.log('Location obtained'); // Debug log
        
        // Load nearby charging stations
        await this.loadNearbyStations();
        console.log('Stations loaded'); // Debug log
    }

    async initializeMap() {
        return new Promise((resolve) => {
            // Check if Google Maps API is loaded
            if (typeof google === 'undefined') {
                // If API key is not set, create a placeholder map
                this.createPlaceholderMap();
                resolve();
                return;
            }

            // Initialize Google Maps
            const mapOptions = {
                zoom: 13,
                center: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
                styles: this.getMapStyles(),
                mapTypeControl: false,
                fullscreenControl: false,
                streetViewControl: false,
                zoomControl: true
            };

            this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
            
            // Add map event listeners
            this.map.addListener('click', () => {
                this.hideStationPanel();
            });

            resolve();
        });
    }

    createPlaceholderMap() {
        const mapElement = document.getElementById('map');
        mapElement.innerHTML = `
            <div style="
                width: 100%; 
                height: 100%; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex; 
                align-items: center; 
                justify-content: center; 
                color: white; 
                text-align: center;
                padding: 2rem;
            ">
                <div>
                    <i class="fas fa-map" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3>Google Maps Integration</h3>
                    <p>To enable the full map functionality, please add your Google Maps API key to the HTML file.</p>
                    <p style="font-size: 0.875rem; margin-top: 1rem; opacity: 0.8;">
                        Replace 'YOUR_API_KEY' in the script tag with your actual API key.
                    </p>
                </div>
            </div>
        `;
    }

    getMapStyles() {
        return [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            },
            {
                featureType: 'transit',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ];
    }

    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                this.showError('Geolocation is not supported by this browser.');
                reject(new Error('Geolocation not supported'));
                return;
            }

            const locationInfo = document.getElementById('current-location');
            locationInfo.textContent = 'Getting location...';

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.currentPosition = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    // Update location display
                    this.reverseGeocode(this.currentPosition.lat, this.currentPosition.lng);
                    
                    // Center map on user's location
                    if (this.map) {
                        this.map.setCenter(this.currentPosition);
                        this.map.setZoom(14);
                        
                        // Add user location marker
                        this.addUserLocationMarker();
                    }

                    resolve(this.currentPosition);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    locationInfo.textContent = 'Location unavailable';
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            );
        });
    }

    async reverseGeocode(lat, lng) {
        try {
            if (typeof google === 'undefined') {
                document.getElementById('current-location').textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                return;
            }

            const geocoder = new google.maps.Geocoder();
            const response = await geocoder.geocode({ location: { lat, lng } });
            
            if (response.results[0]) {
                const address = response.results[0].formatted_address;
                document.getElementById('current-location').textContent = address;
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            document.getElementById('current-location').textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
    }

    addUserLocationMarker() {
        if (!this.map || !this.currentPosition) return;

        const userMarker = new google.maps.Marker({
            position: this.currentPosition,
            map: this.map,
            title: 'Your Location',
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#2563eb',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2
            },
            zIndex: 1000
        });

        // Add info window for user location
        const infoWindow = new google.maps.InfoWindow({
            content: '<div style="text-align: center;"><strong>Your Location</strong><br>You are here</div>'
        });

        userMarker.addListener('click', () => {
            infoWindow.open(this.map, userMarker);
        });
    }

    async loadNearbyStations() {
        try {
            // Generate mock stations around current location
            this.generateMockStations();
            console.log('Generated stations:', this.chargingStations); // Debug log
            
            // Add markers to map
            this.addStationMarkers();
            
            // Update stations grid
            this.updateStationsGrid();
            
            // Update stats
            this.updateStats();
            
            // Update battery gauge to check range warnings
            this.updateBatteryGauge();
            
            console.log('Stations loaded successfully'); // Debug log
        } catch (error) {
            console.error('Failed to load nearby stations:', error);
            this.showError('Failed to load charging stations.');
        }
    }

    generateMockStations() {
        if (!this.currentPosition) {
            this.currentPosition = { lat: 40.7128, lng: -74.0060 }; // Default to NYC
        }

        const stationTypes = [
            { type: 'fast', name: 'Tesla Supercharger', price: '$0.35/kWh', availability: 'Available' },
            { type: 'fast', name: 'Electrify America', price: '$0.43/kWh', availability: 'Available' },
            { type: 'normal', name: 'ChargePoint Station', price: '$0.28/kWh', availability: 'Available' },
            { type: 'normal', name: 'EVgo Charger', price: '$0.32/kWh', availability: 'Available' },
            { type: 'free', name: 'City Hall Charger', price: 'Free', availability: 'Available' },
            { type: 'fast', name: 'Volta Charging', price: '$0.38/kWh', availability: 'Available' },
            { type: 'normal', name: 'Greenlots Station', price: '$0.25/kWh', availability: 'Available' },
            { type: 'free', name: 'Library Charger', price: 'Free', availability: 'Available' },
            { type: 'fast', name: 'Blink Charging', price: '$0.40/kWh', availability: 'Available' },
            { type: 'normal', name: 'SemaConnect', price: '$0.30/kWh', availability: 'Available' }
        ];

        this.chargingStations = stationTypes.map((station, index) => {
            // Generate random position within ~5km radius
            const radius = 0.05; // ~5km in degrees
            const angle = Math.random() * 2 * Math.PI;
            const distance = Math.random() * radius;
            
            const lat = this.currentPosition.lat + distance * Math.cos(angle);
            const lng = this.currentPosition.lng + distance * Math.sin(angle);
            
            const stationNames = [
                'Downtown EV Hub', 'Central Station', 'Green Energy Point', 'EcoCharge Station',
                'Power Plaza', 'Electric Avenue', 'Charge Central', 'EV Oasis', 'Power Point',
                'Green Station', 'Eco Hub', 'Charge Zone', 'Power Station', 'Electric Hub'
            ];

            const distanceString = this.calculateDistance(this.currentPosition.lat, this.currentPosition.lng, lat, lng);
            const numericDistance = this.lastCalculatedDistance;
            
            return {
                id: index + 1,
                name: stationNames[index % stationNames.length],
                type: station.type,
                price: station.price,
                availability: station.availability,
                available: station.availability === 'Available', // Add available property
                position: { lat, lng },
                address: this.generateMockAddress(lat, lng),
                distance: distanceString, // Formatted string for display
                numericDistance: numericDistance, // Numeric value for calculations
                power: station.type === 'fast' ? '150-350 kW' : '7-22 kW',
                connectors: station.type === 'fast' ? 'CCS, CHAdeMO' : 'Type 2, Type 1'
            };
        });

        // Sort by distance
        this.chargingStations.sort((a, b) => a.numericDistance - b.numericDistance);
    }

    generateMockAddress(lat, lng) {
        const streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Maple Dr', 'Cedar Ln', 'Birch Way', 'Willow St'];
        const cities = ['New York', 'Brooklyn', 'Queens', 'Manhattan', 'Bronx', 'Staten Island'];
        
        const street = streets[Math.floor(Math.random() * streets.length)];
        const number = Math.floor(Math.random() * 999) + 1;
        const city = cities[Math.floor(Math.random() * cities.length)];
        
        return `${number} ${street}, ${city}, NY`;
    }

    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        // Store the numeric value for calculations
        this.lastCalculatedDistance = distance;
        
        // Return formatted string for display
        return distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`;
    }

    addStationMarkers() {
        if (!this.map) return;

        // Clear existing markers
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = [];

        this.chargingStations.forEach(station => {
            const marker = new google.maps.Marker({
                position: station.position,
                map: this.map,
                title: station.name,
                icon: this.createCustomMarker(station.type),
                animation: google.maps.Animation.DROP
            });

            // Add click event
            marker.addListener('click', () => {
                this.showStationInfo(station);
            });

            this.markers.push(marker);
        });
    }

    createCustomMarker(type) {
        const colors = {
            fast: '#f59e0b',
            normal: '#2563eb',
            free: '#22c55e'
        };

        return {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: colors[type] || '#2563eb',
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 2
        };
    }

    showStationInfo(station) {
        // Hide previous info window
        if (this.currentInfoWindow) {
            this.currentInfoWindow.close();
        }

        // Create info window
        const content = `
            <div style="padding: 1rem; max-width: 250px;">
                <h3 style="margin: 0 0 0.5rem 0; color: #1f2937;">${station.name}</h3>
                <p style="margin: 0 0 0.5rem 0; color: #6b7280; font-size: 0.875rem;">
                    <i class="fas fa-map-marker-alt"></i> ${station.distance} away
                </p>
                <p style="margin: 0 0 0.5rem 0; color: #6b7280; font-size: 0.875rem;">
                    <i class="fas fa-bolt"></i> ${station.power}
                </p>
                <p style="margin: 0 0 0.5rem 0; color: #6b7280; font-size: 0.875rem;">
                    <i class="fas fa-dollar-sign"></i> ${station.price}
                </p>
                <div style="margin-top: 1rem;">
                    <button id="view-details-${station.id}" 
                            style="background: #2563eb; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.375rem; cursor: pointer; width: 100%;">
                        View Details
                    </button>
                </div>
            </div>
        `;

        this.currentInfoWindow = new google.maps.InfoWindow({
            content: content
        });

        this.currentInfoWindow.open(this.map, this.markers.find(m => 
            m.getPosition().lat() === station.position.lat && 
            m.getPosition().lng() === station.position.lng
        ));

        // Add event listener to the button after the info window is opened
        setTimeout(() => {
            const button = document.getElementById(`view-details-${station.id}`);
            if (button) {
                button.addEventListener('click', () => {
                    this.showStationPanel(station.id);
                    this.currentInfoWindow.close();
                });
            }
        }, 100);
    }

    showStationPanel(stationId) {
        console.log('showStationPanel called with stationId:', stationId); // Debug log
        const panel = document.querySelector('.station-panel');
        const station = this.chargingStations.find(s => s.id === stationId);
        
        console.log('Station panel element found:', panel); // Debug log
        console.log('Station found:', station); // Debug log
        
        if (panel && station) {
            // Update panel content with correct element IDs
            document.getElementById('station-name').textContent = station.name;
            document.getElementById('station-address').textContent = station.address;
            document.getElementById('station-distance').textContent = `${station.numericDistance.toFixed(1)} km`;
            document.getElementById('station-type').textContent = station.type === 'fast' ? 'DC Fast' : 
                                                             station.type === 'normal' ? 'AC Type2' : 'Free';
            document.getElementById('station-price').textContent = station.type === 'free' ? 'Free' : `$${station.price}/kWh`;
            document.getElementById('station-availability').textContent = station.available ? 'Available' : 'Occupied';
            
            // Show panel
            panel.classList.add('active');
            console.log('Station panel should now be visible'); // Debug log
        }
    }

    hideStationPanel() {
        document.getElementById('station-panel').classList.remove('active');
    }

    updateStationsGrid() {
        const grid = document.getElementById('stations-grid');
        const filteredStations = this.getFilteredStations();
        
        console.log('Updating stations grid with:', filteredStations); // Debug log
        console.log('Grid element found:', grid); // Debug log
        
        if (grid) {
            grid.innerHTML = filteredStations.map(station => this.createStationCard(station)).join('');
            console.log('Grid HTML updated'); // Debug log
            
            // Add event listeners to new cards
            this.addStationCardListeners();
        } else {
            console.error('Stations grid element not found!'); // Debug log
        }
    }

    getFilteredStations() {
        if (this.activeFilter === 'all') {
            return this.chargingStations;
        }
        return this.chargingStations.filter(station => station.type === this.activeFilter);
    }

    createStationCard(station) {
        const typeLabels = {
            fast: 'Fast Charger',
            normal: 'Normal Charger',
            free: 'Free Station'
        };

        const typeColors = {
            fast: 'fast',
            normal: 'normal',
            free: 'free'
        };

        return `
            <div class="station-card" data-station-id="${station.id}">
                <div class="station-header">
                    <h3 class="station-name">${station.name}</h3>
                    <span class="station-type ${typeColors[station.type]}">
                        <i class="fas fa-bolt"></i>
                        ${typeLabels[station.type]}
                    </span>
                </div>
                <div class="station-details">
                    <div class="detail-row">
                        <span class="detail-label">Distance</span>
                        <span class="detail-value">${station.distance}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Power</span>
                        <span class="detail-value">${station.power}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Price</span>
                        <span class="detail-value">${station.price}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Connectors</span>
                        <span class="detail-value">${station.connectors}</span>
                    </div>
                </div>
                <div class="station-actions">
                    <button class="action-btn book-btn" data-station-id="${station.id}">
                        <i class="fas fa-calendar-plus"></i>
                        Book Slot
                    </button>
                    <button class="action-btn directions-btn" data-lat="${station.position.lat}" data-lng="${station.position.lng}">
                        <i class="fas fa-directions"></i>
                        Directions
                    </button>
                </div>
            </div>
        `;
    }

    addStationCardListeners() {
        // Add event listeners for station card buttons using event delegation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.book-btn')) {
                const stationId = e.target.closest('.book-btn').dataset.stationId;
                const station = this.chargingStations.find(s => s.id === parseInt(stationId));
                if (station) {
                    // Redirect to booking page with query params
                    const params = new URLSearchParams({
                        station: station.name,
                        price: String(station.price),
                        type: station.type
                    });
                    window.location.href = `booking.html?${params.toString()}`;
                }
            } else if (e.target.closest('.directions-btn')) {
                const button = e.target.closest('.directions-btn');
                const lat = parseFloat(button.dataset.lat);
                const lng = parseFloat(button.dataset.lng);
                this.getDirections(lat, lng);
            }
        });
    }

    updateStats() {
        const totalStations = this.chargingStations.length;
        const fastChargers = this.chargingStations.filter(s => s.type === 'fast').length;
        const freeStations = this.chargingStations.filter(s => s.type === 'free').length;

        document.getElementById('total-stations').textContent = totalStations;
        document.getElementById('fast-chargers').textContent = fastChargers;
        document.getElementById('free-stations').textContent = freeStations;
    }

    getDirections(lat, lng) {
        if (!this.currentPosition) {
            this.showError('Please allow location access to get directions.');
            return;
        }

        const url = `https://www.google.com/maps/dir/${this.currentPosition.lat},${this.currentPosition.lng}/${lat},${lng}`;
        window.open(url, '_blank');
    }

    setupEventListeners() {
        console.log('setupEventListeners started'); // Debug log
        
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });

        // Filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.applyFilter(e.target.dataset.filter);
            });
        });

        // Map controls
        document.getElementById('locate-me').addEventListener('click', () => {
            this.locateUser();
        });

        document.getElementById('refresh-stations').addEventListener('click', () => {
            this.loadNearbyStations();
        });

        // Station panel
        document.getElementById('close-panel').addEventListener('click', () => {
            this.hideStationPanel();
        });

        // Use event delegation for Book Slot button to ensure it works when dynamically shown
        document.addEventListener('click', (e) => {
            if (e.target.id === 'book-slot-btn' || e.target.closest('#book-slot-btn')) {
                const stationName = document.getElementById('station-name').textContent;
                const station = this.chargingStations.find(s => s.name === stationName);
                if (station) {
                    const params = new URLSearchParams({
                        station: station.name,
                        price: String(station.price),
                        type: station.type
                    });
                    window.location.href = `booking.html?${params.toString()}`;
                } else {
                    this.showNotification('Please select a station to book', 'info');
                }
            }
        });

        document.getElementById('directions-btn').addEventListener('click', () => {
            this.getDirectionsFromPanel();
        });

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.station-panel') && !e.target.closest('.custom-pin')) {
                this.hideStationPanel();
            }
        });
        
        console.log('setupEventListeners completed'); // Debug log
    }

    switchSection(sectionId) {
        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === sectionId);
        });

        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
        });
    }

    applyFilter(filter) {
        this.activeFilter = filter;
        
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        // Update stations grid
        this.updateStationsGrid();
    }

    async locateUser() {
        try {
            await this.getCurrentLocation();
            this.showSuccess('Location updated successfully!');
        } catch (error) {
            this.showError('Failed to update location.');
        }
    }

    bookSlot(station) {
        console.log('bookSlot called with station:', station); // Debug log
        if (station) {
            console.log('Opening booking modal for station:', station.name); // Debug log
            this.openBookingModal(station);
        } else {
            console.log('No station provided to bookSlot'); // Debug log
            this.showNotification('Please select a station to book', 'info');
        }
    }

    getDirectionsFromPanel() {
        const stationName = document.getElementById('station-name').textContent;
        const station = this.chargingStations.find(s => s.name === stationName);
        if (station) {
            this.getDirections(station.position.lat, station.position.lng);
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Hide and remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Booking Modal Methods
    openBookingModal(station) {
        console.log('openBookingModal called with station:', station); // Debug log
        this.currentBookingStation = station;
        const modal = document.getElementById('booking-modal');
        const stationName = document.getElementById('booking-station-name');
        
        console.log('Modal element found:', modal); // Debug log
        console.log('Station name element found:', stationName); // Debug log
        
        // Set station name in modal header
        stationName.textContent = `Book Slot - ${station.name}`;
        
        // Set default date/time (next available slot)
        const dateTimeInput = document.getElementById('booking-date-time');
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30); // 30 minutes from now
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        dateTimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
        
        // Reset form
        document.getElementById('booking-duration').value = '';
        document.getElementById('booking-vehicle').value = '';
        
        // Show modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        console.log('Modal should now be visible'); // Debug log
        
        // Update price estimate
        this.updatePriceEstimate();
        
        // Setup booking modal event listeners
        this.setupBookingModalListeners();
    }

    closeBookingModal() {
        const modal = document.getElementById('booking-modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.currentBookingStation = null;
    }

    setupBookingModalListeners() {
        // Close modal events
        document.getElementById('close-booking-modal').onclick = () => this.closeBookingModal();
        document.getElementById('cancel-booking').onclick = () => this.closeBookingModal();
        
        // Close modal when clicking outside
        document.getElementById('booking-modal').onclick = (e) => {
            if (e.target.id === 'booking-modal') {
                this.closeBookingModal();
            }
        };
        
        // Form change events for price updates
        document.getElementById('booking-duration').onchange = () => this.updatePriceEstimate();
        document.getElementById('booking-vehicle').onchange = () => this.updatePriceEstimate();
        
        // Confirm booking
        document.getElementById('confirm-booking').onclick = () => this.confirmBooking();
    }

    updatePriceEstimate() {
        console.log('updatePriceEstimate called'); // Debug log
        console.log('Current booking station:', this.currentBookingStation); // Debug log
        
        const duration = parseInt(document.getElementById('booking-duration').value) || 0;
        const vehicle = document.getElementById('booking-vehicle').value;
        
        console.log('Duration:', duration, 'Vehicle:', vehicle); // Debug log
        
        if (!duration || !vehicle) {
            document.getElementById('charging-cost').textContent = '$0.00';
            document.getElementById('service-fee').textContent = '$0.00';
            document.getElementById('total-price').textContent = '$0.00';
            return;
        }
        
        // Calculate charging cost based on station type and duration
        let ratePerHour = 0;
        if (this.currentBookingStation) {
            switch (this.currentBookingStation.type) {
                case 'fast':
                    ratePerHour = 0.45; // $0.45 per hour for DC Fast
                    break;
                case 'normal':
                    ratePerHour = 0.25; // $0.25 per hour for AC Type2
                    break;
                case 'free':
                    ratePerHour = 0; // Free charging
                    break;
                default:
                    ratePerHour = 0.30; // Default rate
            }
        }
        
        console.log('Rate per hour:', ratePerHour); // Debug log
        
        const chargingCost = (ratePerHour * duration) / 60; // Convert minutes to hours
        const serviceFee = chargingCost > 0 ? 2.50 : 0; // $2.50 service fee for paid charging
        const total = chargingCost + serviceFee;
        
        console.log('Charging cost:', chargingCost, 'Service fee:', serviceFee, 'Total:', total); // Debug log
        
        // Update price display
        document.getElementById('charging-cost').textContent = `$${chargingCost.toFixed(2)}`;
        document.getElementById('service-fee').textContent = `$${serviceFee.toFixed(2)}`;
        document.getElementById('total-price').textContent = `$${total.toFixed(2)}`;
    }

    async confirmBooking() {
        const dateTime = document.getElementById('booking-date-time').value;
        const duration = document.getElementById('booking-duration').value;
        const vehicle = document.getElementById('booking-vehicle').value;
        
        if (!dateTime || !duration || !vehicle) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Create booking object
        const booking = {
            id: Date.now().toString(),
            stationId: this.currentBookingStation.id,
            stationName: this.currentBookingStation.name,
            dateTime: dateTime,
            duration: parseInt(duration),
            vehicle: vehicle,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            price: parseFloat(document.getElementById('total-price').textContent.replace('$', ''))
        };
        
        // Store booking in localStorage
        this.saveBooking(booking);
        
        // Close modal
        this.closeBookingModal();
        
        // Show success animation
        this.showSuccessAnimation();
        
        // Show success notification
        this.showNotification('Slot booked successfully!', 'success');
        
        // Update bookings section
        this.updateBookingsSection();
    }

    saveBooking(booking) {
        let bookings = JSON.parse(localStorage.getItem('intellicharge_bookings') || '[]');
        bookings.push(booking);
        localStorage.setItem('intellicharge_bookings', JSON.stringify(bookings));
    }

    getBookings() {
        return JSON.parse(localStorage.getItem('intellicharge_bookings') || '[]');
    }

    showSuccessAnimation() {
        const successOverlay = document.getElementById('success-overlay');
        successOverlay.style.display = 'flex';
        
        // Setup close button
        document.getElementById('close-success').onclick = () => {
            successOverlay.style.display = 'none';
        };
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (successOverlay.style.display === 'flex') {
                successOverlay.style.display = 'none';
            }
        }, 5000);
    }

    updateBookingsSection() {
        const bookings = this.getBookings();
        const bookingsList = document.getElementById('bookings-list');
        
        if (bookingsList) {
            if (bookings.length === 0) {
                bookingsList.innerHTML = `
                    <div class="text-center">
                        <i class="fas fa-calendar-times fa-3x text-muted mb-4"></i>
                        <h3>No Bookings Yet</h3>
                        <p>Book your first charging slot to get started!</p>
                    </div>
                `;
            } else {
                bookingsList.innerHTML = bookings.map(booking => `
                    <div class="booking-item">
                        <div class="booking-header">
                            <span class="booking-station">${booking.stationName}</span>
                            <span class="booking-status ${booking.status}">${booking.status}</span>
                        </div>
                        <div class="booking-details">
                            <div class="booking-detail">
                                <span class="booking-detail-label">Date & Time</span>
                                <span class="booking-detail-value">${new Date(booking.dateTime).toLocaleString()}</span>
                            </div>
                            <div class="booking-detail">
                                <span class="booking-detail-label">Duration</span>
                                <span class="booking-detail-value">${booking.duration} minutes</span>
                            </div>
                            <div class="booking-detail">
                                <span class="booking-detail-label">Vehicle</span>
                                <span class="booking-detail-value">${this.getVehicleDisplayName(booking.vehicle)}</span>
                            </div>
                            <div class="booking-detail">
                                <span class="booking-detail-label">Price</span>
                                <span class="booking-detail-value">$${booking.price.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    getVehicleDisplayName(vehicleType) {
        const vehicleNames = {
            'tesla': 'Tesla',
            'nissan': 'Nissan Leaf',
            'chevrolet': 'Chevrolet Bolt',
            'bmw': 'BMW i3',
            'audi': 'Audi e-tron',
            'other': 'Other'
        };
        return vehicleNames[vehicleType] || vehicleType;
    }

    // Battery Management Methods
    updateBatteryGauge() {
        console.log('Updating battery gauge...'); // Debug log
        
        // Calculate estimated range
        const estimatedRange = this.calculateEstimatedRange();
        
        // Update battery percentage display
        document.getElementById('battery-percentage').textContent = `${this.batteryPercentage}%`;
        
        // Update battery status
        const batteryStatus = this.getBatteryStatus();
        document.getElementById('battery-status').textContent = batteryStatus;
        
        // Update estimated range
        document.getElementById('estimated-range').textContent = `${estimatedRange.toFixed(0)} km`;
        
        // Update battery capacity
        document.getElementById('battery-capacity').textContent = `${this.batteryCapacity} kWh`;
        
        // Update efficiency
        document.getElementById('battery-efficiency').textContent = `${this.batteryEfficiency} km/kWh`;
        
        // Update circular progress ring
        this.updateProgressRing();
        
        // Check range warning
        this.checkRangeWarning(estimatedRange);
        
        console.log('Battery gauge updated successfully'); // Debug log
    }

    calculateEstimatedRange() {
        // Formula: range_km = (battery_capacity_kWh × battery_percent / 100) × efficiency_km_per_kWh
        const availableCapacity = (this.batteryCapacity * this.batteryPercentage) / 100;
        const estimatedRange = availableCapacity * this.batteryEfficiency;
        return estimatedRange;
    }

    getBatteryStatus() {
        if (this.batteryPercentage >= 80) return 'Excellent';
        if (this.batteryPercentage >= 60) return 'Good';
        if (this.batteryPercentage >= 40) return 'Fair';
        if (this.batteryPercentage >= 20) return 'Low';
        return 'Critical';
    }

    updateProgressRing() {
        const circle = document.querySelector('.progress-ring-circle');
        if (circle) {
            const circumference = 2 * Math.PI * 54; // r = 54
            const offset = circumference - (this.batteryPercentage / 100) * circumference;
            circle.style.strokeDashoffset = offset;
            
            // Update circle color based on battery level
            if (this.batteryPercentage >= 60) {
                circle.style.stroke = '#22c55e'; // Green
            } else if (this.batteryPercentage >= 30) {
                circle.style.stroke = '#f59e0b'; // Yellow
            } else {
                circle.style.stroke = '#ef4444'; // Red
            }
        }
    }

    checkRangeWarning(estimatedRange) {
        const warningElement = document.getElementById('range-warning');
        
        if (this.chargingStations.length > 0) {
            // Find nearest station
            const nearestStation = this.chargingStations[0]; // Already sorted by distance
            const distanceToNearest = nearestStation.numericDistance;
            const requiredRange = distanceToNearest + this.reserveBuffer;
            
            console.log(`Estimated range: ${estimatedRange.toFixed(1)} km, Required: ${requiredRange.toFixed(1)} km`); // Debug log
            
            if (estimatedRange < requiredRange) {
                // Show warning
                warningElement.style.display = 'flex';
                warningElement.innerHTML = `
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Warning: Insufficient range! Need ${requiredRange.toFixed(1)} km, have ${estimatedRange.toFixed(1)} km</span>
                `;
                
                // Add pulsing animation to the gauge
                document.querySelector('.battery-gauge-card').classList.add('warning-pulse');
            } else {
                // Hide warning
                warningElement.style.display = 'none';
                document.querySelector('.battery-gauge-card').classList.remove('warning-pulse');
            }
        }
    }

    // Method to simulate battery drain (for demo purposes)
    simulateBatteryDrain() {
        if (this.batteryPercentage > 0) {
            this.batteryPercentage = Math.max(0, this.batteryPercentage - 1);
            this.updateBatteryGauge();
        }
    }

    // Method to simulate battery charging (for demo purposes)
    simulateBatteryCharge() {
        if (this.batteryPercentage < 100) {
            this.batteryPercentage = Math.min(100, this.batteryPercentage + 1);
            this.updateBatteryGauge();
        }
    }

    // Method to update battery efficiency based on driving conditions
    updateBatteryEfficiency(conditions = 'normal') {
        const efficiencyMap = {
            'city': 5.5,      // City driving - lower efficiency
            'normal': 6.0,    // Normal driving
            'highway': 6.5,   // Highway driving - better efficiency
            'eco': 7.0        // Eco mode - best efficiency
        };
        
        this.batteryEfficiency = efficiencyMap[conditions] || 6.0;
        this.updateBatteryGauge();
    }
}

// Test functions for debugging
function testBookingModal() {
    console.log('Test function called');
    if (window.intelliCharge) {
        console.log('IntelliCharge instance found');
        // Create a test station
        const testStation = {
            id: 'test',
            name: 'Test Station',
            type: 'fast',
            price: 0.45,
            available: true,
            address: '123 Test St, Test City',
            distance: 1.5
        };
        console.log('Opening test modal with station:', testStation);
        window.intelliCharge.openBookingModal(testStation);
    } else {
        console.error('IntelliCharge instance not found');
    }
}

function testBatteryDrain() {
    if (window.intelliCharge) {
        window.intelliCharge.simulateBatteryDrain();
    }
}

function testBatteryCharge() {
    if (window.intelliCharge) {
        window.intelliCharge.simulateBatteryCharge();
    }
}

function testBatteryEfficiency(mode) {
    if (window.intelliCharge) {
        window.intelliCharge.updateBatteryEfficiency(mode);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired'); // Debug log
    window.intelliCharge = new IntelliCharge();
    
    // Initialize the app after a short delay to ensure DOM is ready
    setTimeout(() => {
        console.log('Starting IntelliCharge initialization...'); // Debug log
        window.intelliCharge.init();
    }, 100);
});

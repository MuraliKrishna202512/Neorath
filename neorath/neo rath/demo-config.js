// IntelliCharge Demo Configuration
// Modify these settings to customize your application

window.IntelliChargeConfig = {
    // Application Settings
    app: {
        name: 'IntelliCharge',
        version: '1.0.0',
        defaultLocation: {
            lat: 40.7128,  // Default latitude (New York City)
            lng: -74.0060, // Default longitude
            zoom: 13       // Default zoom level
        }
    },

    // Google Maps Configuration
    maps: {
        // Custom map styles (optional)
        styles: [
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
        ],
        
        // Map controls
        controls: {
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false,
            zoomControl: true
        }
    },

    // Charging Station Types
    stationTypes: {
        fast: {
            label: 'Fast Charger',
            color: '#f59e0b',
            power: '150-350 kW',
            connectors: 'CCS, CHAdeMO',
            icon: 'fas fa-bolt',
            description: 'DC Fast Charging'
        },
        normal: {
            label: 'Normal Charger',
            color: '#2563eb',
            power: '7-22 kW',
            connectors: 'Type 2, Type 1',
            icon: 'fas fa-plug',
            description: 'AC Standard Charging'
        },
        free: {
            label: 'Free Station',
            color: '#22c55e',
            power: '7-22 kW',
            connectors: 'Type 2, Type 1',
            icon: 'fas fa-gift',
            description: 'Complimentary Charging'
        }
    },

    // Mock Data Configuration
    mockData: {
        // Station generation radius (in degrees, roughly 5km)
        radius: 0.05,
        
        // Number of stations to generate
        stationCount: 10,
        
        // Station names pool
        stationNames: [
            'Downtown EV Hub',
            'Central Station',
            'Green Energy Point',
            'EcoCharge Station',
            'Power Plaza',
            'Electric Avenue',
            'Charge Central',
            'EV Oasis',
            'Power Point',
            'Green Station',
            'Eco Hub',
            'Charge Zone',
            'Power Station',
            'Electric Hub'
        ],
        
        // Address generation
        addresses: {
            streets: ['Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Maple Dr', 'Cedar Ln', 'Birch Way', 'Willow St'],
            cities: ['New York', 'Brooklyn', 'Queens', 'Manhattan', 'Bronx', 'Staten Island'],
            state: 'NY'
        },
        
        // Pricing configuration
        pricing: {
            fast: ['$0.35/kWh', '$0.38/kWh', '$0.40/kWh', '$0.43/kWh'],
            normal: ['$0.25/kWh', '$0.28/kWh', '$0.30/kWh', '$0.32/kWh'],
            free: ['Free']
        }
    },

    // UI Configuration
    ui: {
        // Animation durations (in milliseconds)
        animations: {
            fadeIn: 300,
            slideIn: 300,
            bounce: 1000
        },
        
        // Notification settings
        notifications: {
            duration: 5000,  // How long notifications stay visible
            position: 'top-right'  // Position on screen
        },
        
        // Loading settings
        loading: {
            minDisplayTime: 1500,  // Minimum time to show loading screen
            spinnerIcon: 'fas fa-bolt'
        }
    },

    // Feature Flags
    features: {
        geolocation: true,      // Enable/disable location services
        reverseGeocoding: true, // Enable/disable address lookup
        mockData: true,         // Enable/disable mock data generation
        animations: true,       // Enable/disable UI animations
        notifications: true     // Enable/disable toast notifications
    },

    // API Configuration
    api: {
        // Google Maps API endpoints (for future use)
        endpoints: {
            maps: 'https://maps.googleapis.com/maps/api/js',
            geocoding: 'https://maps.googleapis.com/maps/api/geocode/json'
        },
        
        // Rate limiting (for future API integration)
        rateLimit: {
            requestsPerMinute: 60,
            requestsPerHour: 1000
        }
    },

    // Localization (for future multi-language support)
    localization: {
        defaultLanguage: 'en',
        supportedLanguages: ['en'],
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm'
    },

    // Debug Configuration
    debug: {
        enabled: false,         // Enable debug mode
        logLevel: 'info',       // Log level: 'debug', 'info', 'warn', 'error'
        showConsoleInfo: true,  // Show initialization info in console
        mockApiDelay: 1500      // Simulated API delay for demo purposes
    }
};

// Helper function to get configuration values
window.getConfig = function(path) {
    const keys = path.split('.');
    let value = window.IntelliChargeConfig;
    
    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return undefined;
        }
    }
    
    return value;
};

// Helper function to set configuration values
window.setConfig = function(path, value) {
    const keys = path.split('.');
    let config = window.IntelliChargeConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
        if (!config[keys[i]] || typeof config[keys[i]] !== 'object') {
            config[keys[i]] = {};
        }
        config = config[keys[i]];
    }
    
    config[keys[keys.length - 1]] = value;
};

// Export configuration for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.IntelliChargeConfig;
}



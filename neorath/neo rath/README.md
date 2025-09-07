# IntelliCharge - Smart EV Charging Dashboard

A modern, responsive web application for finding and booking EV charging stations with real-time Google Maps integration and advanced features.

![IntelliCharge Dashboard](https://img.shields.io/badge/Status-Ready-brightgreen)
![Technology](https://img.shields.io/badge/Tech-HTML5%20%7C%20CSS3%20%7C%20JavaScript-blue)
![Framework](https://img.shields.io/badge/Framework-Vanilla%20JS-orange)

## 🚀 Features

### 🌍 Live Google Maps Integration
- **Interactive Map**: Full Google Maps JavaScript API integration
- **Real-time Location**: Automatic user location detection using Geolocation API
- **Custom Map Pins**: Animated charging station markers with different colors
- **Responsive Design**: Mobile-first approach with touch-friendly controls

### 🔌 Smart Charging Station Management
- **Station Types**: 
  - 🟡 **Fast Chargers (DC Fast)**: 150-350 kW charging capability
  - 🔵 **Normal Chargers (AC Type2)**: 7-22 kW standard charging
  - 🟢 **Free Chargers**: Complimentary charging stations
- **Live Information**: Real-time availability, pricing, and connector types
- **Distance Calculation**: Accurate distance from user's current location
- **Filtering System**: Easy filtering by charger type and availability

### 📱 Modern User Interface
- **Responsive Dashboard**: Beautiful statistics cards with real-time data
- **Station Cards**: Detailed information with booking and directions
- **Floating Info Panel**: Rich station details with action buttons
- **Smooth Animations**: CSS transitions and micro-interactions
- **Mobile Optimized**: Touch-friendly interface for all devices

### 🎯 Advanced Functionality
- **Booking System**: Slot booking interface (ready for backend integration)
- **Directions**: One-click navigation to charging stations
- **Location Services**: GPS integration with reverse geocoding
- **Real-time Updates**: Live station status and availability
- **Search & Filter**: Advanced filtering and search capabilities

## 🛠️ Technology Stack

- **Frontend**: Pure HTML5, CSS3, and Vanilla JavaScript
- **Maps**: Google Maps JavaScript API v3
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Inter (Google Fonts)
- **Responsive**: CSS Grid and Flexbox
- **Animations**: CSS3 Transitions and Keyframes

## 📋 Prerequisites

Before running IntelliCharge, ensure you have:

- A modern web browser with JavaScript enabled
- Internet connection for Google Maps API and external resources
- Google Maps JavaScript API key (for full functionality)

## 🚀 Quick Start

### 1. Clone or Download
```bash
git clone <repository-url>
cd intellicharge
```

### 2. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Maps JavaScript API** and **Geocoding API**
4. Create credentials (API Key)
5. Copy your API key

### 3. Configure API Key
Open `index.html` and replace `YOUR_API_KEY` with your actual API key:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=places"></script>
```

### 4. Run the Application
- **Local Development**: Open `index.html` in your web browser
- **Live Server**: Use VS Code Live Server extension
- **HTTP Server**: Use any local HTTP server (Python, Node.js, etc.)

```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

### 5. Access the Application
Open your browser and navigate to:
- **Local**: `http://localhost:8000`
- **File**: `file:///path/to/index.html`

## 🎨 Customization

### Colors and Themes
Modify CSS custom properties in `styles.css`:

```css
:root {
    --primary-color: #2563eb;      /* Main brand color */
    --secondary-color: #10b981;    /* Success/Green color */
    --accent-color: #f59e0b;       /* Warning/Orange color */
    --danger-color: #ef4444;       /* Error/Red color */
    /* ... more variables */
}
```

### Map Styling
Customize Google Maps appearance in `script.js`:

```javascript
getMapStyles() {
    return [
        {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
        }
        // Add more custom styles
    ];
}
```

### Station Data
Modify mock data generation in `script.js`:

```javascript
generateMockStations() {
    // Customize station types, names, and locations
    const stationTypes = [
        { type: 'fast', name: 'Custom Fast Charger', price: '$0.40/kWh' }
        // Add more station types
    ];
}
```

## 📱 Responsive Breakpoints

- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px
- **Mobile**: 480px - 767px
- **Small Mobile**: Below 480px

## 🔧 API Integration

### Google Maps API
- **Maps JavaScript API**: Interactive map functionality
- **Geocoding API**: Address reverse geocoding
- **Places API**: Enhanced location services

### Geolocation API
- **Current Position**: User location detection
- **High Accuracy**: GPS and network-based positioning
- **Fallback Support**: Graceful degradation for unsupported browsers

## 🚀 Deployment

### Static Hosting
Deploy to any static hosting service:

- **GitHub Pages**: Free hosting for public repositories
- **Netlify**: Drag & drop deployment
- **Vercel**: Automatic deployments from Git
- **AWS S3**: Scalable cloud hosting
- **Firebase Hosting**: Google's hosting solution

### Production Considerations
1. **API Key Security**: Restrict API key to your domain
2. **HTTPS**: Enable SSL for production
3. **Performance**: Minify CSS/JS files
4. **Caching**: Implement proper cache headers
5. **CDN**: Use CDN for external resources

## 🧪 Testing

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Testing Checklist
- [ ] Map loads correctly
- [ ] Location detection works
- [ ] Station markers display
- [ ] Info windows open
- [ ] Station panel functions
- [ ] Responsive design works
- [ ] All buttons functional
- [ ] Navigation between sections

## 🐛 Troubleshooting

### Common Issues

#### Map Not Loading
- Check API key configuration
- Verify API is enabled in Google Cloud Console
- Check browser console for errors
- Ensure internet connection

#### Location Not Detected
- Allow location access in browser
- Check HTTPS requirement (some browsers require secure context)
- Verify geolocation permissions

#### Styling Issues
- Clear browser cache
- Check CSS file loading
- Verify Font Awesome CDN access

### Debug Mode
Enable console logging by adding this to your browser console:

```javascript
localStorage.setItem('debug', 'true');
```

## 🔮 Future Enhancements

- **Real-time Data**: Live station availability from APIs
- **User Authentication**: Login and user profiles
- **Booking System**: Real slot booking with backend
- **Payment Integration**: Credit card and digital wallet support
- **Notifications**: Push notifications for booking updates
- **Offline Support**: Service Worker for offline functionality
- **Multi-language**: Internationalization support
- **Dark Mode**: Theme switching capability

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:

- **Issues**: Create a GitHub issue
- **Documentation**: Check this README
- **Community**: Join our discussions

## 🙏 Acknowledgments

- **Google Maps API**: For mapping functionality
- **Font Awesome**: For beautiful icons
- **Inter Font**: For modern typography
- **CSS Grid & Flexbox**: For responsive layouts

---

**Built with ❤️ using modern web technologies**

*IntelliCharge - Making EV charging smarter and more accessible*



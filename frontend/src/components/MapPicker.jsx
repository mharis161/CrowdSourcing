import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Trash2, MapPin, Plus, Globe, Layers } from 'lucide-react';

// Fix for default marker icons in Leaflet with Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const countries = {
  'Pakistan': {
    lat: 30.3753, lng: 69.3451, zoom: 5,
    cities: {
      'Islamabad': { lat: 33.6844, lng: 73.0479 },
      'Karachi': { lat: 24.8607, lng: 67.0011 },
      'Lahore': { lat: 31.5204, lng: 74.3587 },
      'Peshawar': { lat: 34.0151, lng: 71.5249 },
      'Rawalpindi': { lat: 33.5651, lng: 73.0169 },
    }
  },
  'UAE': {
    lat: 23.4241, lng: 53.8478, zoom: 7,
    cities: {
      'Dubai': { lat: 25.2048, lng: 55.2708 },
      'Abu Dhabi': { lat: 24.4539, lng: 54.3773 },
      'Sharjah': { lat: 25.3463, lng: 55.4209 },
    }
  },
  'UK': {
    lat: 55.3781, lng: -3.4360, zoom: 5,
    cities: {
      'London': { lat: 51.5074, lng: -0.1278 },
      'Manchester': { lat: 53.4808, lng: -2.2426 },
      'Birmingham': { lat: 52.4862, lng: -1.8904 },
    }
  }
};

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

function LocationMarker({ position, setPosition }) {
  const map = useMap();
  
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

const MapPicker = ({ onLocationsUpdate, initialLocations = [] }) => {
  // Derive initial map position from existing locations (if editing)
  const hasInitial = initialLocations && initialLocations.length > 0;
  const firstLoc = hasInitial ? initialLocations[0] : null;

  const [selectedCountry, setSelectedCountry] = useState('Pakistan');
  const [selectedCity, setSelectedCity] = useState('Islamabad');
  const [position, setPosition] = useState(
    firstLoc
      ? { lat: firstLoc.latitude, lng: firstLoc.longitude }
      : countries['Pakistan'].cities['Islamabad']
  );
  const [radius, setRadius] = useState(1000);
  const [locationName, setLocationName] = useState('');
  const [zoom, setZoom] = useState(hasInitial ? 13 : 12);
  // Initialize directly — parent uses key={editingTaskId||'new'} so this runs fresh every time
  const [locations, setLocations] = useState(initialLocations);

  // Notify parent whenever the user modifies locations (add / remove)
  useEffect(() => {
    onLocationsUpdate(locations);
  }, [locations]);

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    const firstCity = Object.keys(countries[country].cities)[0];
    setSelectedCity(firstCity);
    setPosition(countries[country].cities[firstCity]);
    setZoom(countries[country].zoom);
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    setPosition(countries[selectedCountry].cities[city]);
    setZoom(13);
  };

  const addLocation = () => {
    if (!position) return;
    const newLoc = {
      latitude: position.lat,
      longitude: position.lng,
      radius,
      locationName: locationName || `${selectedCity} Unit ${locations.length + 1}`
    };
    setLocations([...locations, newLoc]);
    setLocationName('');
  };

  const removeLocation = (index) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. Integrated Navigation Header */}
      <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm shrink-0">
        <div className="flex-1 flex items-center gap-2 px-3 border-r border-slate-100">
          <Globe className="w-4 h-4 text-slate-400" />
          <select 
            value={selectedCountry}
            onChange={handleCountryChange}
            className="w-full h-9 bg-transparent text-[11px] font-black text-slate-800 outline-none appearance-none cursor-pointer"
          >
            {Object.keys(countries).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex-1 flex items-center gap-2 px-3">
          <MapPin className="w-4 h-4 text-slate-400" />
          <select 
            value={selectedCity}
            onChange={handleCityChange}
            className="w-full h-9 bg-transparent text-[11px] font-black text-slate-800 outline-none appearance-none cursor-pointer"
          >
            {Object.keys(countries[selectedCountry].cities).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* 2. Full-Width Premium Map - Forces enough height */}
      <div className="relative h-[500px] min-h-[500px] w-full rounded-[2rem] overflow-hidden border-2 border-white shadow-2xl ring-1 ring-slate-200 shrink-0">
        <MapContainer 
          center={position} 
          zoom={zoom} 
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <ChangeView center={position} zoom={zoom} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker position={position} setPosition={setPosition} />
          <Circle 
            center={position} 
            radius={radius}
            pathOptions={{ fillColor: '#7f0df2', color: '#7f0df2', fillOpacity: 0.1, weight: 1.5 }}
          />
          {locations.map((loc, i) => (
            <React.Fragment key={i}>
              <Marker position={[loc.latitude, loc.longitude]} />
              <Circle 
                center={[loc.latitude, loc.longitude]} 
                radius={loc.radius}
                pathOptions={{ fillColor: '#10b981', color: '#10b981', fillOpacity: 0.05, weight: 1 }}
              />
            </React.Fragment>
          ))}
        </MapContainer>
        
        {/* Floating Scale Indicator */}
        <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-200 shadow-xl pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#7f0df2] rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-slate-900 uppercase tracking-tighter">Precision Selector</span>
          </div>
        </div>
      </div>

      {/* 3. Cohesive Marker Configuration Toolbar */}
      <div className="bg-white p-4 rounded-[1.5rem] border border-slate-200 shadow-lg flex items-end gap-4 shrink-0">
        <div className="flex-[2] space-y-1.5">
          <label className="text-[9px] font-black text-slate-400 capitalize tracking-widest pl-1">Target Name</label>
          <input 
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold focus:bg-white focus:border-[#7f0df2] outline-none transition-all"
            placeholder="e.g. Islamabad - Blue Area"
          />
        </div>
        <div className="flex-[3] space-y-1.5">
          <div className="flex justify-between px-1">
            <label className="text-[9px] font-black text-slate-400 capitalize tracking-widest">Marking Radius</label>
            <span className="text-[10px] font-black text-[#7f0df2] bg-purple-50 px-2 py-0.5 rounded-md">{radius}m</span>
          </div>
          <div className="h-11 flex items-center px-4 bg-slate-50 border border-slate-100 rounded-xl">
            <input 
              type="range" min="100" max="5000" step="100" 
              value={radius} onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#7f0df2]"
            />
          </div>
        </div>
        <button 
          type="button"
          onClick={addLocation}
          className="h-11 px-6 bg-[#1a1a1a] text-white text-[10px] font-black rounded-xl hover:bg-black flex items-center gap-2 transition-all active:scale-95 shadow-xl shadow-slate-200"
        >
          <Plus className="w-4 h-4" /> ADD UNIT
        </button>
      </div>

      {/* 4. Horizontal Saved Locations Tray */}
      <div className="space-y-3 shrink-0">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 pl-1">
           <Layers className="w-3.5 h-3.5 text-[#7f0df2]" /> Deployment Units ({locations.length})
        </label>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1">
          {locations.length === 0 ? (
            <div className="w-full text-center py-6 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
               <span className="text-[10px] text-slate-400 font-bold italic">No geographic units marked yet. Drop a pin to initialize.</span>
            </div>
          ) : (
            locations.map((loc, i) => (
              <div key={i} className="shrink-0 flex items-center gap-4 pl-4 pr-2 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all group border-b-2 hover:border-b-[#7f0df2]">
                <div className="flex flex-col leading-tight">
                  <span className="text-[11px] font-black text-slate-900 leading-none">{loc.locationName}</span>
                  <div className="flex items-center gap-1.5 mt-1 text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                    <span className="text-[#7f0df2]">R</span>
                    <span>{loc.radius}m</span>
                  </div>
                </div>
                <button 
                  onClick={() => removeLocation(i)}
                  className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPicker;

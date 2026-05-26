import { useState, useRef, useEffect, useCallback } from "react";
import { autocompleteAddress, getPlaceDetails } from "../services/addressService";
import { authFetch } from "../services/authService";
import { parseApiResponse } from "../services/apiClient";

const DEBOUNCE_MS = 400;
let googleMapsLoaded = false;
let googleMapsPromise = null;

function loadGoogleMapsScript(apiKey) {
  if (googleMapsLoaded) return Promise.resolve();
  if (googleMapsPromise) return googleMapsPromise;
  if (!apiKey) return Promise.reject(new Error("No Google Maps API key"));

  googleMapsPromise = new Promise((resolve, reject) => {
    // Check if Maps API is already fully loaded
    if (window.google?.maps?.Map) {
      googleMapsLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=vi&region=VN`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Poll until Map constructor is available
      let attempts = 0;
      const checkReady = setInterval(() => {
        if (window.google?.maps?.Map) {
          clearInterval(checkReady);
          googleMapsLoaded = true;
          resolve();
        } else if (++attempts > 50) {
          clearInterval(checkReady);
          reject(new Error("Google Maps API failed to initialize"));
        }
      }, 100);
    };
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
  return googleMapsPromise;
}

export default function AddressPicker({ onAddressChange, initialAddress = {} }) {
  const [apiKey, setApiKey] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [inputValue, setInputValue] = useState(initialAddress?.fullAddress || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [form, setForm] = useState({
    fullAddress: initialAddress?.fullAddress || "",
    street: initialAddress?.street || "",
    ward: initialAddress?.ward || "",
    district: initialAddress?.district || "",
    city: initialAddress?.city || "",
    latitude: initialAddress?.latitude || null,
    longitude: initialAddress?.longitude || null,
    placeId: initialAddress?.placeId || "",
  });

  const timerRef = useRef(null);
  const wrapperRef = useRef(null);
  const mapRef = useRef(null);
  const mapDivRef = useRef(null);
  const markerRef = useRef(null);

  // Fetch API key on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch("/maps/api-key");
        const payload = await parseApiResponse(res);
        if (payload?.data?.apiKey) {
          setApiKey(payload.data.apiKey);
        }
      } catch { /* noop */ }
    })();
  }, []);

  // Load Google Maps script when API key is ready
  useEffect(() => {
    if (!apiKey || mapLoaded) return;
    loadGoogleMapsScript(apiKey)
      .then(() => setMapLoaded(true))
      .catch(() => {});
  }, [apiKey, mapLoaded]);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapDivRef.current || mapRef.current) return;

    const defaultCenter = form.latitude && form.longitude
      ? { lat: form.latitude, lng: form.longitude }
      : { lat: 10.762622, lng: 106.660172 }; // HCM center

    mapRef.current = new window.google.maps.Map(mapDivRef.current, {
      center: defaultCenter,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    if (form.latitude && form.longitude) {
      markerRef.current = new window.google.maps.Marker({
        position: defaultCenter,
        map: mapRef.current,
        animation: window.google.maps.Animation.DROP,
        draggable: true,
      });
      markerRef.current.addListener("dragend", () => {
        const pos = markerRef.current.getPosition();
        reverseGeocode(pos.lat(), pos.lng());
      });
    }
  }, [mapLoaded]);

  // Reverse geocode lat/lng to address
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const result = await geocoder.geocode({ location: { lat, lng } });
      if (result.results?.[0]) {
        const comps = parseAddressComponents(result.results[0].address_components);
        const addr = result.results[0].formatted_address;
        setInputValue(addr);
        const data = {
          fullAddress: addr,
          street: [comps.street_number, comps.route].filter(Boolean).join(" "),
          ward: comps.ward || comps.sublocality_level_1 || "",
          district: comps.administrative_area_level_2 || "",
          city: comps.administrative_area_level_1 || "",
          latitude: lat,
          longitude: lng,
          placeId: result.results[0].place_id || "",
        };
        setForm(data);
        onAddressChange?.(data);
      }
    } catch { /* noop */ }
  }, [onAddressChange]);

  function parseAddressComponents(components) {
    const map = {};
    components?.forEach((c) => {
      c.types?.forEach((t) => { map[t] = c.long_name; });
    });
    return map;
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Autocomplete search
  const doSearch = useCallback(async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    setLoading(true);
    try {
      const results = await autocompleteAddress(query);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setSelectedIndex(-1);
    } catch {
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(val), DEBOUNCE_MS);
  };

  const handleSelectPlace = async (suggestion) => {
    setInputValue(suggestion.description);
    setIsOpen(false);
    setSuggestions([]);

    try {
      const details = await getPlaceDetails(suggestion.placeId);
      if (details) {
        const data = {
          fullAddress: details.formattedAddress || suggestion.description,
          street: [details.streetNumber, details.route].filter(Boolean).join(" "),
          ward: details.ward || "",
          district: details.district || "",
          city: details.city || "",
          latitude: details.latitude,
          longitude: details.longitude,
          placeId: details.placeId || suggestion.placeId,
        };
        setForm(data);
        onAddressChange?.(data);

        // Update map
        if (mapRef.current && details.latitude && details.longitude) {
          const pos = { lat: details.latitude, lng: details.longitude };
          mapRef.current.setCenter(pos);
          mapRef.current.setZoom(16);
          if (markerRef.current) {
            markerRef.current.setPosition(pos);
          } else {
            markerRef.current = new window.google.maps.Marker({
              position: pos,
              map: mapRef.current,
              animation: window.google.maps.Animation.DROP,
              draggable: true,
            });
            markerRef.current.addListener("dragend", () => {
              const newPos = markerRef.current.getPosition();
              reverseGeocode(newPos.lat(), newPos.lng());
            });
          }
        }
      }
    } catch { /* noop */ }
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectPlace(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4" ref={wrapperRef}>
      {/* LEFT: Search + Info */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Search box */}
        <div className="relative">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 mb-1 block">
            Tìm kiếm địa chỉ
          </label>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
              placeholder="Nhập địa chỉ để tìm kiếm..."
              className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 rounded-xl text-sm
                         focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none
                         bg-white transition-shadow"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full" />
              </div>
            )}
          </div>

          {/* Dropdown suggestions */}
          {isOpen && suggestions.length > 0 && (
            <ul className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg
                           max-h-52 overflow-y-auto">
              {suggestions.map((s, idx) => (
                <li
                  key={s.placeId}
                  onClick={() => handleSelectPlace(s)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-4 py-2.5 cursor-pointer text-sm border-b border-zinc-100 last:border-0
                    ${idx === selectedIndex
                      ? "bg-amber-50 text-amber-900"
                      : "hover:bg-zinc-50 text-zinc-700"}`}
                >
                  <div className="font-medium truncate">{s.mainText}</div>
                  {s.secondaryText && (
                    <div className="text-xs text-zinc-400 mt-0.5 truncate">{s.secondaryText}</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Selected address display */}
        {form.latitude && form.longitude && (
          <div className="rounded-2xl border border-green-200 bg-green-50/50 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-green-700">
              📍 Địa chỉ đã chọn
            </p>
            <p className="text-sm font-medium text-zinc-800">{form.fullAddress}</p>
            <div className="flex flex-wrap gap-1.5 text-xs text-zinc-500">
              {form.street && <span className="bg-white rounded-full px-2 py-0.5 border border-zinc-200">🏠 {form.street}</span>}
              {form.ward && <span className="bg-white rounded-full px-2 py-0.5 border border-zinc-200">{form.ward}</span>}
              {form.district && <span className="bg-white rounded-full px-2 py-0.5 border border-zinc-200">{form.district}</span>}
              {form.city && <span className="bg-white rounded-full px-2 py-0.5 border border-zinc-200">{form.city}</span>}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: Google Map */}
      <div className="flex-1 min-w-[300px] min-h-[300px]">
        <div
          ref={mapDivRef}
          className="w-full h-full min-h-[300px] rounded-2xl border border-zinc-200 bg-zinc-100"
          style={{ minHeight: "300px" }}
        >
          {!mapLoaded && (
            <div className="flex items-center justify-center h-full text-sm text-zinc-400">
              <div className="text-center">
                <div className="animate-spin h-6 w-6 border-2 border-zinc-300 border-t-amber-500 rounded-full mx-auto mb-2" />
                Đang tải bản đồ...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

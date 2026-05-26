import { useState, useRef, useEffect, useCallback } from "react";
import {
  autocompleteAddress,
  getPlaceDetails,
} from "../services/addressService";

const DEBOUNCE_MS = 400;

export default function AddressAutocompleteInput({
  value = "",
  onChange,
  onPlaceSelect,
  placeholder = "Nhập địa chỉ để tìm kiếm...",
  className = "",
}) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const timerRef = useRef(null);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    onChange?.(val);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(val), DEBOUNCE_MS);
  };

  const handleSelect = async (suggestion) => {
    setInputValue(suggestion.description);
    onChange?.(suggestion.description);
    setIsOpen(false);
    setSuggestions([]);

    // Fetch place details (lat, lng, address components)
    try {
      const details = await getPlaceDetails(suggestion.placeId);
      if (details && onPlaceSelect) {
        onPlaceSelect({
          fullAddress: details.formattedAddress || suggestion.description,
          street: [details.streetNumber, details.route]
            .filter(Boolean)
            .join(" "),
          ward: details.ward || "",
          district: details.district || "",
          city: details.city || "",
          latitude: details.latitude,
          longitude: details.longitude,
          placeId: details.placeId || suggestion.placeId,
        });
      }
    } catch {
      // If place details fail, still set basic info
      if (onPlaceSelect) {
        onPlaceSelect({
          fullAddress: suggestion.description,
          placeId: suggestion.placeId,
        });
      }
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1,
      );
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm
                     focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none
                     transition-shadow"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg
                       max-h-60 overflow-y-auto"
        >
          {suggestions.map((s, idx) => (
            <li
              key={s.placeId}
              onClick={() => handleSelect(s)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`px-4 py-2.5 cursor-pointer text-sm border-b border-gray-50 last:border-0
                ${idx === selectedIndex ? "bg-amber-50 text-amber-900" : "hover:bg-gray-50 text-gray-700"}`}
            >
              <div className="font-medium">{s.mainText}</div>
              {s.secondaryText && (
                <div className="text-xs text-gray-500 mt-0.5">
                  {s.secondaryText}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

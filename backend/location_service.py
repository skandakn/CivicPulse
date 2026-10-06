"""Location lookup with a bounded, cached OpenStreetMap fallback.

The application does not currently ship an authoritative GBA ward polygon file.
Until one is configured, ward and zone are deliberately returned as unavailable.
"""

from __future__ import annotations

import threading
import time
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional, Tuple

import requests


class LocationProvider(ABC):
    @abstractmethod
    def resolve(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """Return normalized address metadata for a selected point."""


class OpenStreetMapProvider(LocationProvider):
    endpoint = "https://nominatim.openstreetmap.org/reverse"
    minimum_request_interval_seconds = 1.1

    def __init__(self) -> None:
        self._request_lock = threading.Lock()
        self._last_request_at = 0.0

    def resolve(self, latitude: float, longitude: float) -> Dict[str, Any]:
        # Nominatim's public service allows at most one request per second.
        with self._request_lock:
            wait = self.minimum_request_interval_seconds - (time.monotonic() - self._last_request_at)
            if wait > 0:
                time.sleep(wait)
            self._last_request_at = time.monotonic()

            response = requests.get(
                self.endpoint,
                params={
                    "format": "jsonv2",
                    "lat": latitude,
                    "lon": longitude,
                    "zoom": 18,
                    "addressdetails": 1,
                    "extratags": 1,
                },
                headers={"User-Agent": "CivicPulse/1.0 (Bengaluru civic issue reporting; https://github.com/skandakn/CivicPulse)"},
                timeout=4,
            )
            response.raise_for_status()
            payload = response.json()

        address = payload.get("address") or {}
        admin_names = [
            address.get(key, "")
            for key in ("city", "city_district", "municipality", "county", "state_district")
        ]
        admin_text = " ".join(admin_names).casefold()
        state = address.get("state") or ""
        city_match = "bengaluru" in admin_text or "bangalore" in admin_text
        is_within_bengaluru: Optional[bool]
        if city_match:
            is_within_bengaluru = True
        elif state:
            is_within_bengaluru = False
        else:
            is_within_bengaluru = None

        # Nominatim reverse lookup can return a nearby building or POI. Only
        # use a road when its returned OSM object is explicitly a highway.
        is_road_object = payload.get("category") == "highway" or payload.get("class") == "highway"
        road_name = address.get("road") if is_road_object else None
        extratags = payload.get("extratags") or {}
        locality = next(
            (address.get(key) for key in ("suburb", "quarter", "neighbourhood", "city_district", "town", "city", "village") if address.get(key)),
            None,
        )
        source_url = (
            f"https://www.openstreetmap.org/?mlat={latitude:.6f}&mlon={longitude:.6f}"
            f"#map=18/{latitude:.6f}/{longitude:.6f}"
        )
        return {
            "latitude": latitude,
            "longitude": longitude,
            "lat": latitude,
            "lng": longitude,
            "address": road_name or locality or "Not available",
            "roadName": road_name,
            "roadClass": payload.get("type") if is_road_object else None,
            "roadReference": extratags.get("ref") if is_road_object else None,
            "locality": locality,
            "ward": None,
            "zone": None,
            "city": next((name for name in admin_names if "bengaluru" in name.casefold() or "bangalore" in name.casefold()), None),
            "state": state or None,
            "source": "OpenStreetMap / Nominatim",
            "sourceUrl": source_url,
            "confidence": 0.9 if road_name and locality and city_match else 0.7 if locality and city_match else 0.45 if is_within_bengaluru else 0.0,
            "isWithinBengaluru": is_within_bengaluru,
            "resolved": bool(payload.get("place_id")),
        }


class CachedLocationProvider(LocationProvider):
    """Cache exact, rounded click lookups in-process to avoid repeat requests."""

    cache_ttl_seconds = 24 * 60 * 60

    def __init__(self, provider: LocationProvider) -> None:
        self.provider = provider
        self._cache: Dict[Tuple[float, float], Tuple[float, Dict[str, Any]]] = {}
        self._lock = threading.Lock()

    def resolve(self, latitude: float, longitude: float) -> Dict[str, Any]:
        key = (round(latitude, 5), round(longitude, 5))
        now = time.monotonic()
        with self._lock:
            cached = self._cache.get(key)
            if cached and cached[0] > now:
                return {**cached[1], "latitude": latitude, "longitude": longitude, "source": f"Cached GIS · {cached[1]['source']}"}

        result = self.provider.resolve(latitude, longitude)
        if result.get("resolved"):
            with self._lock:
                self._cache[key] = (now + self.cache_ttl_seconds, result)
        return result


_location_provider: LocationProvider = CachedLocationProvider(OpenStreetMapProvider())


def resolve_location(latitude: float, longitude: float) -> Dict[str, Any]:
    try:
        return _location_provider.resolve(latitude, longitude)
    except (requests.RequestException, ValueError, KeyError) as exc:
        return {
            "latitude": latitude,
            "longitude": longitude,
            "lat": latitude,
            "lng": longitude,
            "address": "Not available",
            "roadName": None,
            "roadClass": None,
            "roadReference": None,
            "locality": None,
            "ward": None,
            "zone": None,
            "city": None,
            "state": None,
            "source": "Not available",
            "sourceUrl": None,
            "confidence": 0.0,
            "isWithinBengaluru": None,
            "resolved": False,
            "error": str(exc),
        }

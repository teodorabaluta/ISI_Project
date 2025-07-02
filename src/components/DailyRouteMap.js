import React, { useEffect, useState } from "react";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  InfoWindow,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import './DailyRouteMap.css';

const DailyRouteMap = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const groupId = queryParams.get("group");
  const selectedDate = queryParams.get("date");

  const [events, setEvents] = useState([]);
  const [directions, setDirections] = useState(null);
  const [center, setCenter] = useState({ lat: 44.4268, lng: 26.1025 }); 
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [travelMode, setTravelMode] = useState("WALKING");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedMarker, setSelectedMarker] = useState(null);


  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyC2RelmO1xwOqOvoBWJOkS0ra1d7Fh89QE",
    libraries: ["places"],
  });

  // Se incarca locatia userului
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setCenter({ lat: latitude, lng: longitude });
        },
        (err) => console.error("Error getting location:", err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Incarca evenimentele pe ziua selectata
  useEffect(() => {
    if (!groupId || !selectedDate) return;

    const eventsRef = collection(db, `groups/${groupId}/events`);
    const unsubscribe = onSnapshot(eventsRef, (snapshot) => {
      const dailyEvents = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(event => {
          if (!event.start) return false;
          let eventDate;
          if (typeof event.start === "object" && event.start.toDate) {
            const dateObj = event.start.toDate();
            const year = dateObj.getFullYear();
            const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
            const day = dateObj.getDate().toString().padStart(2, '0');
            eventDate = `${year}-${month}-${day}`;
          } else {
            const dateObj = new Date(event.start);
            if (isNaN(dateObj.getTime())) return false;
            const year = dateObj.getFullYear();
            const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
            const day = dateObj.getDate().toString().padStart(2, '0');
            eventDate = `${year}-${month}-${day}`;
          }
          return eventDate === selectedDate;
        })
        .sort((a, b) => new Date(a.start) - new Date(b.start));

      setEvents(dailyEvents);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId, selectedDate]);

  // Genereaza ruta cu modul de transport selectat
  useEffect(() => {
    if (!isLoaded || events.length < 2) return;

    const directionsService = new window.google.maps.DirectionsService();

    const origin = { lat: events[0].lat, lng: events[0].lng };
    const destination = { lat: events[events.length - 1].lat, lng: events[events.length - 1].lng };
    const waypoints = events.slice(1, -1).map(event => ({
      location: { lat: event.lat, lng: event.lng },
      stopover: true,
    }));

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: window.google.maps.TravelMode[travelMode],
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);
          setCenter(origin);

          // Calculeaza distanta totala si durata
          const route = result.routes[0];
          const totalDistance = route.legs.reduce((acc, leg) => acc + leg.distance.value, 0);
          const totalDuration = route.legs.reduce((acc, leg) => acc + leg.duration.value, 0);
          setDistance(`${(totalDistance / 1000).toFixed(2)} km`);
          setDuration(`${Math.ceil(totalDuration / 60)} minute`);
        } else {
          console.error("Error generating route", status);
        }
      }
    );
  }, [events, isLoaded, travelMode]);

  if (!isLoaded) return <div>Se încarcă harta...</div>;
  if (loading) return <div>Se încarcă datele...</div>;
  if (!groupId || !selectedDate) return <div style={{ textAlign: "center", marginTop: "2rem" }}>Parametrii lipsă în URL.</div>;
  if (events.length === 0) return <div style={{ textAlign: "center", marginTop: "2rem" }}>Nu există activități în această zi.</div>;
  if (events.length < 2) return <div style={{ textAlign: "center", marginTop: "2rem" }}>Nu există suficiente activități pentru a genera traseul.</div>;

  return (
    <div className="daily-route-container">
      <div className="controls">
        <label htmlFor="travelMode">Mod transport: </label>
        <select
          id="travelMode"
          value={travelMode}
          onChange={(e) => setTravelMode(e.target.value)}
        >
          <option value="DRIVING">🚗 Mașină</option>
          <option value="WALKING">🚶 Pe jos</option>
          <option value="TRANSIT">🚌 Transport public</option>
        </select>
      </div>

      <div className="map-wrapper">
        <GoogleMap mapContainerStyle={{ height: "100%", width: "100%" }} center={center} zoom={14}>
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
              title="Locația ta"
            />
          )}

          {events.map(event => (
            <Marker
              key={event.id}
              position={{ lat: event.lat, lng: event.lng }}
              title={event.title}
              onClick={() => setSelectedMarker(event)}
            />
          ))}

          {directions && <DirectionsRenderer directions={directions} />}

          {selectedMarker && (
            <InfoWindow
              position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div>
                <h4>{selectedMarker.title}</h4>
                <p>Locație: {selectedMarker.location || "N/A"}</p>
                <p>Start: {new Date(selectedMarker.start).toLocaleString()}</p>
                <p>End: {new Date(selectedMarker.end).toLocaleString()}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      <div className="route-info">
        <p><strong>Distanță totală:</strong> {distance}</p>
        <p><strong>Durată estimată:</strong> {duration}</p>
      </div>
    </div>
  );
};

export default DailyRouteMap;

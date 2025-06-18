import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import './CalendarComponent.css';

const pad = (num) => num.toString().padStart(2, '0');
const localDateToIsoString = (date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const CalendarComponent = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showRouteButton, setShowRouteButton] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: '',
    locationName: '',
    lat: null,
    lng: null,
    start: '',
    end: ''
  });

  const autocompleteRef = useRef(null);

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyC2RelmO1xwOqOvoBWJOkS0ra1d7Fh89QE", // Replace with your API key
    libraries: ["places"],
  });

  useEffect(() => {
    if (!groupId) return;

    const eventsRef = collection(db, `groups/${groupId}/events`);
    const unsubscribe = onSnapshot(eventsRef, (snapshot) => {
      const fetched = snapshot.docs.map(doc => {
        const data = doc.data();
        const start = data.start?.toDate ? data.start.toDate() : new Date(data.start);
        const end = data.end?.toDate ? data.end.toDate() : new Date(data.end);
        return {
          id: doc.id,
          title: data.title,
          location: data.location,
          lat: data.lat,
          lng: data.lng,
          start,
          end
        };
      });
      setEvents(fetched);
    });

    return () => unsubscribe();
  }, [groupId]);

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (!place.geometry) return alert("Locația selectată nu are coordonate.");
    setNewEvent(prev => ({
      ...prev,
      locationName: place.name,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!groupId) return;

    try {
      const start = new Date(newEvent.start);
      const end = new Date(newEvent.end);
      const eventToAdd = {
        title: newEvent.title,
        location: newEvent.locationName,
        lat: newEvent.lat,
        lng: newEvent.lng,
        start,
        end
      };

      await addDoc(collection(db, `groups/${groupId}/events`), eventToAdd);
      setShowForm(false);
      setNewEvent({
        title: '',
        locationName: '',
        lat: null,
        lng: null,
        start: '',
        end: ''
      });
    } catch (err) {
      setError("Failed to add event: " + err.message);
    }
  };

  return (
    <div className="calendar-container">
      <div className="calendar-view">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300 }}
          onClick={() => setShowForm(!showForm)}
          style={{ marginBottom: '1rem' }}
        >
          {showForm ? 'Anulează' : 'Adaugă activitate'}
        </motion.button>

        {showRouteButton && selectedDate && (
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <button
              className="view-route-button"
              onClick={() => navigate(`/daily-route?date=${selectedDate}&group=${groupId}`)}
              style={{
                backgroundColor: '#9523aa',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Vezi traseul pentru {selectedDate}
            </button>
          </div>
        )}

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
          }}
          datesSet={(arg) => {
            const viewType = arg.view.type;

            if (viewType === 'timeGridDay') {
              const dateObj = new Date(arg.start);
              const isoDate = localDateToIsoString(dateObj);
              setShowRouteButton(true);
              setSelectedDate(isoDate);
            } else {
              setShowRouteButton(false);
              setSelectedDate(null);
            }
          }}
          events={events}
          dayMaxEvents
          eventDidMount={(info) => {
            const event = info.event;
            const start = new Date(event.start);
            const end = new Date(event.end);
            const time = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            const tooltip = `<strong>${event.title}</strong><br/>🕒 ${time}<br/>📍 ${event.extendedProps.location || '-'}`;
            tippy(info.el, { content: tooltip, allowHTML: true, animation: 'scale', theme: 'light-border', delay: [100, 100] });
          }}
          eventClick={(info) => {
            const event = info.event;
            setSelectedEvent({
              title: event.title,
              location: event.extendedProps.location,
              lat: event.extendedProps.lat,
              lng: event.extendedProps.lng,
              start: event.start,
              end: event.end
            });
          }}
        />
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            key="event-form"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 120 }}
            className="event-form"
            onSubmit={handleAddEvent}
          >
            {error && <div className="alert">{error}</div>}
            <input name="title" placeholder="Titlu activitate" value={newEvent.title} onChange={handleInputChange} required />
            {isLoaded && (
              <Autocomplete onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)} onPlaceChanged={handlePlaceChanged}>
                <input
                  placeholder="Caută o locație"
                  value={newEvent.locationName}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, locationName: e.target.value }))}
                  required
                />
              </Autocomplete>
            )}
            <input type="datetime-local" name="start" value={newEvent.start} onChange={handleInputChange} required />
            <input type="datetime-local" name="end" value={newEvent.end} onChange={handleInputChange} required />
            <button type="submit">Adaugă</button>
            <button type="button" onClick={() => setShowForm(false)}>Renunță</button>
          </motion.form>
        )}
      </AnimatePresence>

      {selectedEvent && (
        <div className="modal-backdrop" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedEvent.title}</h3>
            <p><strong>🕒</strong> {new Date(selectedEvent.start).toLocaleString()} - {new Date(selectedEvent.end).toLocaleString()}</p>
            <p><strong>📍</strong> {selectedEvent.location || 'N/A'}</p>
            {selectedEvent.lat && selectedEvent.lng && (
              <p><strong>📌</strong> Lat: {selectedEvent.lat}, Lng: {selectedEvent.lng}</p>
            )}
            <button onClick={() => setSelectedEvent(null)}>Închide</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarComponent;

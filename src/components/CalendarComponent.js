import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { motion, AnimatePresence } from 'framer-motion';
import './CalendarComponent.css';

const CalendarComponent = () => {
  const { groupId } = useParams();
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', location: '', start: '', end: '' });
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (!groupId) {
      setError("Group ID is missing!");
      return;
    }

    const eventsRef = collection(db, `groups/${groupId}/events`);
    const unsubscribe = onSnapshot(eventsRef, (querySnapshot) => {
      const fetched = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const start = data.start?.toDate ? data.start.toDate() : new Date(data.start);
        const end = data.end?.toDate ? data.end.toDate() : new Date(data.end);
        return {
          id: doc.id,
          title: data.title,
          location: data.location,
          start,
          end
        };
      });
      setEvents(fetched);
    });

    return () => unsubscribe();
  }, [groupId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!groupId) {
      setError('Group ID is missing!');
      return;
    }

    try {
      const start = new Date(newEvent.start);
      const end = new Date(newEvent.end);
      const eventToAdd = { ...newEvent, start, end };
      const docRef = await addDoc(collection(db, `groups/${groupId}/events`), eventToAdd);
      setEvents([...events, { ...eventToAdd, id: docRef.id }]);
      setShowForm(false);
      setNewEvent({ title: '', location: '', start: '', end: '' });
      setError('');
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
          {showForm ? 'Cancel' : 'Adaugă activitate'}
        </motion.button>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
          }}
          events={events}
          dayMaxEvents={true}
          eventDidMount={(info) => {
            const event = info.event;
            const start = new Date(event.start);
            const end = new Date(event.end);
            const timeOptions = { hour: '2-digit', minute: '2-digit' };
            const formattedTime = `${start.toLocaleTimeString([], timeOptions)} - ${end.toLocaleTimeString([], timeOptions)}`;

            const tooltipContent = `
              <strong>${event.title}</strong><br/>
              🕒 ${formattedTime}<br/>
              📍 ${event.extendedProps.location || '-'}
            `;

            tippy(info.el, {
              content: tooltipContent,
              allowHTML: true,
              animation: 'scale',
              theme: 'light-border',
              delay: [100, 100],
            });
          }}
          eventClick={(info) => {
            const event = info.event;
            setSelectedEvent({
              title: event.title,
              location: event.extendedProps.location,
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
            <input type="text" name="title" value={newEvent.title} onChange={handleInputChange} placeholder="Titlu activitate" />
            <input type="text" name="location" value={newEvent.location} onChange={handleInputChange} placeholder="Locație" />
            <input type="datetime-local" name="start" value={newEvent.start} onChange={handleInputChange} />
            <input type="datetime-local" name="end" value={newEvent.end} onChange={handleInputChange} />
            <button type="submit">Adaugă</button>
            <button type="button" onClick={() => setShowForm(false)}>Renunță</button>
          </motion.form>
        )}
      </AnimatePresence>

      {selectedEvent && (
        <div className="modal-backdrop" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedEvent.title}</h3>
            <p><strong>🕒</strong> {selectedEvent.start.toLocaleString()} - {selectedEvent.end.toLocaleString()}</p>
            <p><strong>📍</strong> {selectedEvent.location || 'N/A'}</p>
            <button onClick={() => setSelectedEvent(null)}>Închide</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarComponent;

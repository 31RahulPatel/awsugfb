import React, { useState, useEffect } from 'react';
import './EventTimer.css';

const EventTimer = ({ eventStartDate, eventName }) => {
  const [timeLeft, setTimeLeft] = useState({});
  const [isEventStarted, setIsEventStarted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const eventTime = new Date(eventStartDate).getTime();
      const difference = eventTime - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
        setIsEventStarted(false);
      } else {
        setIsEventStarted(true);
        setTimeLeft({});
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [eventStartDate]);

  if (isEventStarted) {
    return (
      <div className="event-timer started">
        <h3>🎉 {eventName} is Live!</h3>
        <p>You can now submit feedback for sessions</p>
      </div>
    );
  }

  return (
    <div className="event-timer">
      <h3>Event Starts In:</h3>
      <div className="countdown">
        <div className="time-unit">
          <span className="number">{timeLeft.days || 0}</span>
          <span className="label">Days</span>
        </div>
        <div className="time-unit">
          <span className="number">{timeLeft.hours || 0}</span>
          <span className="label">Hours</span>
        </div>
        <div className="time-unit">
          <span className="number">{timeLeft.minutes || 0}</span>
          <span className="label">Minutes</span>
        </div>
        <div className="time-unit">
          <span className="number">{timeLeft.seconds || 0}</span>
          <span className="label">Seconds</span>
        </div>
      </div>
      <p className="event-date">
        {new Date(eventStartDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
    </div>
  );
};

export default EventTimer;
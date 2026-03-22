import { Calendar, Users, Film } from 'lucide-react';
import './MovieTimeline.css';

export default function MovieTimeline({ clubId, timelines = [] }) {
  return (
    <div className="movie-timeline-container">
      <div className="timeline-header">
        <h3><Calendar size={20} /> Club Movie Timeline</h3>
        <span className="timeline-count">{timelines.length} events</span>
      </div>

      <div className="timeline-list">
        {timelines.length === 0 ? (
          <div className="timeline-empty">
            <Film size={32} />
            <p>No movies watched together yet</p>
            <small>Create a watch party to start your club's history!</small>
          </div>
        ) : (
          timelines.map((event, index) => (
            <div key={event.id} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
              <div className="timeline-dot"></div>
              <div className="timeline-content glass-panel">
                <div className="event-date">
                  {new Date(event.dateWatched).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <h4>{event.movieTitle}</h4>
                <div className="event-meta">
                  <span className="meta-item">
                    <Users size={14} /> {event.attendees?.length || 0} members
                  </span>
                  <span className="meta-item">
                    <Film size={14} /> {event.genre}
                  </span>
                </div>
                {event.notes && (
                  <p className="event-notes">"{event.notes}"</p>
                )}
                <div className="attendees-preview">
                  {event.attendees?.slice(0, 3).map(name => (
                    <div key={name} className="attendee-avatar">
                      {name[0]}
                    </div>
                  ))}
                  {event.attendees?.length > 3 && (
                    <div className="attendee-avatar more">
                      +{event.attendees.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const Notification = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState({
    events: [
      {
        id: 1,
        title: "Pongal Celebration",
        description: "Join us for a vibrant Pongal Celebration event. Celebrate the harvest season with our alumni community!",
        date: "March 15, 2026",
        isRead: false,
        icon: "🎉"
      },
      {
        id: 2,
        title: "Annual Alumni Meet",
        description: "Network with fellow alumni and celebrate our shared memories at the annual reunion.",
        date: "April 20, 2026",
        isRead: false,
        icon: "👥"
      }
    ],
    jobs: [
      {
        id: 3,
        title: "Administrative Assistant",
        company: "Tech Innovations Inc.",
        description: "Join our administrative team! Responsibilities include managing schedules, coordinating meetings, and supporting multiple departments.",
        posted: "2 days ago",
        isRead: false,
        icon: "💼"
      },
      {
        id: 4,
        title: "Marketing Specialist",
        company: "Digital Solutions Ltd.",
        description: "We're looking for a creative marketing professional to drive our digital campaigns and brand growth.",
        posted: "1 week ago",
        isRead: false,
        icon: "📊"
      }
    ],
    messages: [
      {
        id: 5,
        chatId: 3,
        sender: "Sophia Carter",
        lastMessage: "Hey! How have you been? Let's catch up soon!",
        unreadCount: 3,
        timestamp: "15 mins ago",
        isRead: false,
        avatar: "SC"
      },
      {
        id: 6,
        chatId: 4,
        sender: "Ethan Bennett",
        lastMessage: "The project looks great. I'll review it tonight.",
        unreadCount: 1,
        timestamp: "1 hour ago",
        isRead: false,
        avatar: "EB"
      },
      {
        id: 7,
        chatId: 1,
        sender: "Priya Sharma",
        lastMessage: "Thanks for the referral! The interview went well.",
        unreadCount: 0,
        timestamp: "3 hours ago",
        isRead: true,
        avatar: "PS"
      }
    ]
  });

  const filteredNotifications = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return {
      events: notifications.events.filter(e =>
        e.title.toLowerCase().includes(s) || e.description.toLowerCase().includes(s)
      ),
      jobs: notifications.jobs.filter(j =>
        j.title.toLowerCase().includes(s) || j.company.toLowerCase().includes(s) || j.description.toLowerCase().includes(s)
      ),
      messages: notifications.messages.filter(m =>
        m.sender.toLowerCase().includes(s) || m.lastMessage.toLowerCase().includes(s)
      )
    };
  }, [searchTerm, notifications]);

  const handleMarkAsRead = () => {
    setNotifications(prev => ({
      events: prev.events.map(e => ({ ...e, isRead: true })),
      jobs: prev.jobs.map(j => ({ ...j, isRead: true })),
      messages: prev.messages.map(m => ({ ...m, isRead: true }))
    }));
  };

  const unreadCount = [
    ...notifications.events,
    ...notifications.jobs,
    ...notifications.messages
  ].filter(n => !n.isRead).length;

  const hasResults =
    filteredNotifications.events.length > 0 ||
    filteredNotifications.jobs.length > 0 ||
    filteredNotifications.messages.length > 0;

  return (
    <div className="dashboard-main-bg py-4 min-vh-100">
      <div className="container" style={{ maxWidth: '800px' }}>

        {/* Page Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="fw-bold mb-0" style={{ color: '#c84022' }}>Notifications</h2>
          {unreadCount > 0 && (
            <button
              className="btn rounded-pill px-4 flex-shrink-0"
              style={{ border: '1.5px solid #333', color: '#333', backgroundColor: 'transparent', fontWeight: 600, fontSize: '0.9rem' }}
              onClick={handleMarkAsRead}
            >
              Mark as Read
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-4 position-relative">
          <i className="fas fa-search position-absolute text-muted" style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}></i>
          <input
            type="text"
            className="form-control ps-5 rounded-pill"
            placeholder="search notifications"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ borderColor: '#d0d0d0', backgroundColor: '#ffffff' }}
          />
          {searchTerm && (
            <button
              className="btn btn-link position-absolute text-muted p-0"
              style={{ right: '14px', top: '50%', transform: 'translateY(-50%)' }}
              onClick={() => setSearchTerm('')}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        {!hasResults ? (
          <div className="dashboard-card bg-white text-center py-5 rounded-3">
            <i className="fas fa-search text-muted mb-3" style={{ fontSize: '2rem' }}></i>
            <p className="text-muted mb-0">No notifications found matching "<strong>{searchTerm}</strong>"</p>
          </div>
        ) : (
          <>
            {/* College Events Section */}
            {filteredNotifications.events.length > 0 && (
              <div className="mb-4">
                <div className="d-flex align-items-center mb-3">
                  <span className="me-2" style={{ fontSize: '1.2rem' }}>📅</span>
                  <h5 className="fw-bold mb-0 text-dark">College Events</h5>
                  <span
                    className="badge ms-2 fw-bold"
                    style={{ backgroundColor: '#c84022', borderRadius: '12px', fontSize: '0.7rem' }}
                  >
                    {filteredNotifications.events.length}
                  </span>
                </div>
                <div className="d-flex flex-column gap-2">
                  {filteredNotifications.events.map(event => (
                    <div
                      key={event.id}
                      className={`dashboard-card bg-white rounded-3 p-3 d-flex align-items-start gap-3 ${!event.isRead ? 'border-start border-danger border-3' : ''}`}
                      style={{
                        cursor: 'pointer',
                        borderLeft: !event.isRead ? '4px solid #c84022' : '4px solid transparent',
                        transition: 'box-shadow 0.15s, transform 0.15s'
                      }}
                      onClick={() => {
                        setNotifications(prev => ({
                          ...prev,
                          events: prev.events.map(e =>
                            e.id === event.id ? { ...e, isRead: true } : e
                          )
                        }));
                        navigate('/events');
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = '';
                        e.currentTarget.style.transform = '';
                      }}
                    >
                      <div
                        className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: '48px', height: '48px', backgroundColor: 'rgba(200,64,34,0.08)', fontSize: '1.4rem' }}
                      >
                        {event.icon}
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <h6 className="fw-bold mb-0 text-dark">{event.title}</h6>
                          {!event.isRead && (
                            <span className="rounded-circle flex-shrink-0" style={{ width: '8px', height: '8px', backgroundColor: '#c84022', display: 'inline-block' }}></span>
                          )}
                        </div>
                        <p className="text-muted small mb-1" style={{ lineHeight: '1.4' }}>{event.description}</p>
                        <span className="extra-small text-muted">
                          <i className="fas fa-calendar-alt me-1 text-mamcet-red"></i>{event.date}
                        </span>
                      </div>
                      <i className="fas fa-chevron-right text-muted align-self-center"></i>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Job Postings Section */}
            {filteredNotifications.jobs.length > 0 && (
              <div className="mb-4">
                <div className="d-flex align-items-center mb-3">
                  <span className="me-2" style={{ fontSize: '1.2rem' }}>💼</span>
                  <h5 className="fw-bold mb-0 text-dark">Job Postings</h5>
                  <span
                    className="badge ms-2 fw-bold"
                    style={{ backgroundColor: '#c84022', borderRadius: '12px', fontSize: '0.7rem' }}
                  >
                    {filteredNotifications.jobs.length}
                  </span>
                </div>
                <div className="d-flex flex-column gap-2">
                  {filteredNotifications.jobs.map(job => (
                    <div
                      key={job.id}
                      className="dashboard-card bg-white rounded-3 p-3 d-flex align-items-start gap-3"
                      style={{
                        cursor: 'pointer',
                        borderLeft: !job.isRead ? '4px solid #c84022' : '4px solid transparent',
                        transition: 'box-shadow 0.15s, transform 0.15s'
                      }}
                      onClick={() => {
                        setNotifications(prev => ({
                          ...prev,
                          jobs: prev.jobs.map(j =>
                            j.id === job.id ? { ...j, isRead: true } : j
                          )
                        }));
                        navigate('/jobs');
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = '';
                        e.currentTarget.style.transform = '';
                      }}
                    >
                      <div
                        className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: '48px', height: '48px', backgroundColor: 'rgba(200,64,34,0.08)', fontSize: '1.4rem' }}
                      >
                        {job.icon}
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <h6 className="fw-bold mb-0 text-dark">{job.title}</h6>
                          {!job.isRead && (
                            <span className="rounded-circle flex-shrink-0" style={{ width: '8px', height: '8px', backgroundColor: '#c84022', display: 'inline-block' }}></span>
                          )}
                        </div>
                        <p className="extra-small fw-semibold text-muted mb-1">
                          <i className="fas fa-building me-1 text-mamcet-red"></i>{job.company}
                        </p>
                        <p className="text-muted small mb-1" style={{ lineHeight: '1.4' }}>{job.description}</p>
                        <span className="extra-small text-muted">
                          <i className="fas fa-clock me-1 text-mamcet-red"></i>Posted {job.posted}
                        </span>
                      </div>
                      <i className="fas fa-chevron-right text-muted align-self-center"></i>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Direct Messages Section */}
            {filteredNotifications.messages.length > 0 && (
              <div className="mb-4">
                <div className="d-flex align-items-center mb-3">
                  <span className="me-2" style={{ fontSize: '1.2rem' }}>💬</span>
                  <h5 className="fw-bold mb-0 text-dark">Direct Messages</h5>
                  <span
                    className="badge ms-2 fw-bold"
                    style={{ backgroundColor: '#c84022', borderRadius: '12px', fontSize: '0.7rem' }}
                  >
                    {filteredNotifications.messages.length}
                  </span>
                </div>
                <div className="d-flex flex-column gap-2">
                  {filteredNotifications.messages.map(message => (
                    <div
                      key={message.id}
                      className="dashboard-card bg-white rounded-3 p-3 d-flex align-items-start gap-3"
                      style={{
                        cursor: 'pointer',
                        borderLeft: !message.isRead ? '4px solid #c84022' : '4px solid transparent',
                        transition: 'box-shadow 0.15s, transform 0.15s'
                      }}
                      onClick={() => {
                        // Mark as read
                        setNotifications(prev => ({
                          ...prev,
                          messages: prev.messages.map(m =>
                            m.id === message.id ? { ...m, isRead: true, unreadCount: 0 } : m
                          )
                        }));
                        navigate(`/messaging?chatId=${message.chatId}`);
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = '';
                        e.currentTarget.style.transform = '';
                      }}
                    >
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                        style={{ width: '48px', height: '48px', backgroundColor: '#c84022', fontSize: '0.85rem' }}
                      >
                        {message.avatar}
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <div className="d-flex align-items-center gap-2">
                            <h6 className="fw-bold mb-0 text-dark">{message.sender}</h6>
                            {!message.isRead && (
                              <span className="rounded-circle flex-shrink-0" style={{ width: '8px', height: '8px', backgroundColor: '#c84022', display: 'inline-block' }}></span>
                            )}
                          </div>
                          <span className="extra-small text-muted">{message.timestamp}</span>
                        </div>
                        <p className="text-muted small mb-1">{message.lastMessage}</p>
                        {message.unreadCount > 0 && (
                          <span className="badge extra-small fw-semibold" style={{ backgroundColor: '#e8f4fd', color: '#0b66c2', borderRadius: '4px' }}>
                            {message.unreadCount} unread message{message.unreadCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div className="align-self-center d-flex align-items-center gap-2">
                        {message.unreadCount > 0 && (
                          <span
                            className="badge rounded-pill text-white fw-bold"
                            style={{ backgroundColor: '#c84022', fontSize: '0.7rem' }}
                          >
                            {message.unreadCount}
                          </span>
                        )}
                        <i className="fas fa-chevron-right text-muted" style={{ fontSize: '0.75rem' }}></i>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notification;

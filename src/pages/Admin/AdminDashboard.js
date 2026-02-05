import React, { useState } from 'react';
import AdminNavbar from '../../components/admin/AdminNavbar';

const AdminDashboard = () => {
    // இங்க நீங்க வேல்யூஸை மாத்தினா போதும், சார்ட் தானா மாறும்!
    const [stats] = useState({
        students: 3504,
        alumni: 1250,
        staffs: 1500,
        totalUsers: 7059
    });

    const recentMessages = 5;
    const pendingVerifications = 10;

    // சார்ட் கணக்கீடு (CSS Conic-gradient-க்காக)
    const total = stats.students + stats.alumni + stats.staffs;
    const studentPerc = (stats.students / total) * 100;
    const alumniPerc = (stats.alumni / total) * 100;

    // CSS Pie Chart Style
    const pieStyle = {
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: `conic-gradient(
            #22d3ee 0% ${studentPerc}%, 
            #ec4899 ${studentPerc}% ${studentPerc + alumniPerc}%, 
            #a855f7 ${studentPerc + alumniPerc}% 100%
        )`,
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    };

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            <AdminNavbar />
            
            <div className="container py-4 text-center">
                <h3 className="fw-bold text-danger mb-1" style={{ letterSpacing: '1px' }}>DASHBOARD</h3>
                <p className="text-muted small fw-bold mb-5">OVERVIEW</p>

                {/* 1. TOP STATS CARDS */}
                <div className="row justify-content-center mb-5 g-4">
                    {[
                        { label: 'TOTAL ALUMNI', value: stats.alumni },
                        { label: 'TOTAL STUDENTS', value: stats.students },
                        { label: 'TOTAL USERS', value: stats.totalUsers }
                    ].map((item, index) => (
                        <div className="col-md-3" key={index}>
                            <div className="card shadow-sm border-0 p-4" style={{ backgroundColor: '#f0f9ff', borderRadius: '15px' }}>
                                <p className="text-muted fw-bold mb-1" style={{ fontSize: '11px' }}>{item.label}</p>
                                <h2 className="fw-bold mb-0">{item.value}</h2>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 2. DYNAMIC CSS PIE CHART SECTION */}
                <div className="row align-items-center justify-content-center mb-5 py-4">
                    <div className="col-md-4 d-flex justify-content-center">
                        <div style={pieStyle}></div>
                    </div>
                    <div className="col-md-3 text-start ps-lg-5">
                        <div className="mb-3 d-flex align-items-center">
                            <span className="me-3" style={{ width: '40px', height: '15px', backgroundColor: '#22d3ee', display: 'inline-block', borderRadius: '2px' }}></span>
                            <span className="fw-bold small text-muted">STUDENTS ({Math.round(studentPerc)}%)</span>
                        </div>
                        <div className="mb-3 d-flex align-items-center">
                            <span className="me-3" style={{ width: '40px', height: '15px', backgroundColor: '#ec4899', display: 'inline-block', borderRadius: '2px' }}></span>
                            <span className="fw-bold small text-muted">ALUMNI ({Math.round(alumniPerc)}%)</span>
                        </div>
                        <div className="d-flex align-items-center">
                            <span className="me-3" style={{ width: '40px', height: '15px', backgroundColor: '#a855f7', display: 'inline-block', borderRadius: '2px' }}></span>
                            <span className="fw-bold small text-muted">STAFFS ({Math.round(100 - (studentPerc + alumniPerc))}%)</span>
                        </div>
                    </div>
                </div>

                {/* 3. RECENT UPDATES SECTION */}
                <div className="row justify-content-center mt-5">
                    <div className="col-md-8">
                        {/* Messages */}
                        <div className="card shadow-sm border-0 p-4 mb-4 text-start bg-white border rounded">
                            <div className="row align-items-center">
                                <div className="col-8">
                                    <p className="text-danger fw-bold mb-1" style={{ fontSize: '11px' }}>Recent Messages</p>
                                    <h6 className="fw-bold mb-1">{recentMessages} New Messages</h6>
                                    <p className="text-muted small mb-0">Review contact form submissions</p>
                                </div>
                                <div className="col-4 text-end">
                                    <div className="d-inline-block p-3 rounded" style={{ backgroundColor: '#f0f9ff' }}>
                                        <span className="fs-3">✉️</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Verifications */}
                        <div className="card shadow-sm border-0 p-4 text-start bg-white border rounded">
                            <div className="row align-items-center">
                                <div className="col-8">
                                    <p className="text-danger fw-bold mb-1" style={{ fontSize: '11px' }}>Pending Verifications</p>
                                    <h6 className="fw-bold mb-1">{pendingVerifications} Users</h6>
                                    <p className="text-muted small mb-0">Verify new user accounts</p>
                                </div>
                                <div className="col-4 text-end">
                                    <div className="d-inline-block p-3 rounded" style={{ backgroundColor: '#fdf2f8' }}>
                                        <span className="fs-3">👤</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
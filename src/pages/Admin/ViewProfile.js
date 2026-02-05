import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/admin/AdminNavbar';

const ViewProfile = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const alumni = state?.alumni; // Dynamic data from management page

    // டேட்டா இல்லைனா மெயின் பேஜுக்கு திருப்பி அனுப்பும்
    if (!alumni) {
        return (
            <div className="text-center mt-5">
                <h4>No Profile Data Found!</h4>
                <button className="btn btn-primary" onClick={() => navigate('/admin/alumni')}>Go Back</button>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            <AdminNavbar />
            <div className="container py-5">
                {/* Back Button */}
                <button className="btn btn-link text-dark text-decoration-none fw-bold mb-4" onClick={() => navigate(-1)}>
                    <i className="fas fa-arrow-left me-2"></i> BACK
                </button>

                <div className="card border-0 shadow-sm mx-auto p-4" style={{ maxWidth: '800px', borderRadius: '15px' }}>
                    {/* Header Section */}
                    <div className="text-center mb-4">
                        <div className="position-relative d-inline-block">
                            <img 
                                src="https://via.placeholder.com/120" 
                                className="rounded-circle border shadow-sm" 
                                alt="Profile" 
                                style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                            />
                            <span className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-1 px-2 border border-white" style={{ fontSize: '12px' }}>
                                <i className="fas fa-check"></i>
                            </span>
                        </div>
                        <h4 className="fw-bold mt-3 mb-1 text-uppercase">{alumni.name}</h4>
                        <p className="text-muted mb-1">Batch of {alumni.batch} , {alumni.dept}</p>
                        <p className="fw-bold text-primary small">{alumni.role} at {alumni.company}</p>
                    </div>

                    <hr />

                    {/* Details Section */}
                    <div className="row mt-4 px-3">
                        <div className="col-md-6 mb-4">
                            <h6 className="fw-bold text-uppercase small text-muted mb-3">Contact Information</h6>
                            <p className="mb-2"><strong>Email:</strong> {alumni.email}</p>
                            <p className="mb-2"><strong>Department:</strong> {alumni.dept}</p>
                            <p className="mb-2"><strong>Batch:</strong> {alumni.batch}</p>
                        </div>

                        <div className="col-md-6 mb-4">
                            <h6 className="fw-bold text-uppercase small text-muted mb-3">Professional Info</h6>
                            <p className="mb-2"><strong>Current Role:</strong> {alumni.role}</p>
                            <p className="mb-2"><strong>Company:</strong> {alumni.company}</p>
                            <p className="mb-2"><strong>Status:</strong> <span className="text-primary fw-bold">{alumni.status}</span></p>
                        </div>

                        <div className="col-12 mt-3">
                            <h6 className="fw-bold text-uppercase small text-muted mb-2">About</h6>
                            <p className="small text-muted" style={{ lineHeight: '1.6' }}>
                                A dedicated professional with experience in {alumni.dept} and currently contributing as a {alumni.role} at {alumni.company}. 
                                Committed to staying updated with the latest industry trends and contributing to the MAMCET alumni network.
                            </p>
                        </div>

                        <div className="col-12 mt-4 text-center">
                             <button className="btn btn-outline-danger rounded-pill px-5 fw-bold shadow-sm">
                                MESSAGE ALUMNI
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewProfile;
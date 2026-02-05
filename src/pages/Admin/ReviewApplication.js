import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/admin/AdminNavbar';

const ReviewApplication = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const alumni = state?.alumni;

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            <AdminNavbar />
            <div className="container py-5 text-center">
                <h4 className="fw-bold mb-5" style={{ color: '#b22222' }}>REVIEW APPLICATION</h4>
                
                <div className="card border-0 shadow-sm mx-auto p-4" style={{ maxWidth: '700px' }}>
                    <div className="mb-4">
                        <img src="https://via.placeholder.com/100" className="rounded-circle border" alt="profile" />
                        <h5 className="fw-bold mt-3">{alumni?.name || 'Harilakshminarayana'}</h5>
                        <p className="text-muted small mb-0">Batch of 2022 - 2026 , {alumni?.dept || 'CSE'}</p>
                        <p className="text-muted small">UIUX Designer at ABC Company</p>
                    </div>

                    <div className="text-start px-4">
                        <h6 className="fw-bold">ABOUT</h6>
                        <p className="small text-muted">UI/UX Designer with 1+ years of experience... skilled in visual design and front-end development.</p>
                        
                        <h6 className="fw-bold mt-4">Experience</h6>
                        <div className="d-flex gap-2">
                            <span className="fs-4">💼</span>
                            <div>
                                <p className="mb-0 fw-bold small">UIUX Designer</p>
                                <p className="text-muted extra-small">2023 - 2025</p>
                            </div>
                        </div>

                        <h6 className="fw-bold mt-4">Education</h6>
                        <p className="small mb-0">Bachelor of Engineering in Computer science and Engineering</p>
                        <p className="text-muted extra-small">2022 - 2026</p>
                    </div>

                    <div className="mt-5 d-flex justify-content-end gap-4">
                        <button className="btn border-0 text-muted fw-bold" onClick={() => navigate(-1)}>Cancel</button>
                        <button className="btn btn-primary rounded-pill px-5 fw-bold" 
                            onClick={() => navigate('/admin/verify-success', { state: { alumni } })}>
                            Verify
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewApplication;
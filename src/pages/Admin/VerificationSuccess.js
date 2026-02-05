import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/admin/AdminNavbar';

const VerificationSuccess = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const alumni = state?.alumni;

    const handleGoBack = () => {
        const existingData = JSON.parse(localStorage.getItem('alumniData'));
        const updatedData = existingData.map(item => 
            item.id === alumni.id ? { ...item, status: 'Verified' } : item
        );
        localStorage.setItem('alumniData', JSON.stringify(updatedData));
        navigate('/admin/alumni');
    };

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            <AdminNavbar />
            <div className="container py-5 text-center">
                <div className="mt-5 animate__animated animate__zoomIn">
                    {/* Golden Badge Icon */}
                    <div className="mb-3 display-2 text-warning">🏅</div>
                    
                    <h3 className="fw-bold mb-1" style={{ letterSpacing: '1px' }}>SUCCESSFULLY VERIFIED</h3>
                    <p className="text-muted small fw-bold">ADDED AS MAMCET ALUMNI</p>
                    
                    {/* Verified User Details */}
                    <div className="mt-5 mb-5 p-4 border rounded shadow-sm d-inline-block bg-light" style={{ minWidth: '300px' }}>
                        <img 
                            src="https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg" 
                            className="rounded-circle border border-primary p-1" 
                            width="90" height="90" alt="profile" 
                        />
                        <h5 className="fw-bold mt-3 text-uppercase">{alumni?.name || "Hari Laksminarayana"}</h5>
                        <p className="text-primary small fw-bold mb-0">{alumni?.role || "UI/UX Designer"}</p>
                        <p className="text-muted extra-small">at {alumni?.company || "Google"}</p>
                    </div>

                    <br />
                    <button className="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow-lg" onClick={handleGoBack}>
                        Go Back to Management
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerificationSuccess;
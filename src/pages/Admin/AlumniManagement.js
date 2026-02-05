import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/admin/AdminNavbar';

const AlumniManagement = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [alumniList, setAlumniList] = useState([]);

    useEffect(() => {
        const savedData = JSON.parse(localStorage.getItem('alumniData'));
        
        // டேட்டா ஏற்கனவே இருந்தாலோ அல்லது புதுசாக உருவாக்கினாலோ 6 ஃபைல்ஸ் இருக்குமாறு உறுதி செய்கிறோம்
        if (savedData && savedData.length === 6) {
            setAlumniList(savedData);
        } else {
            const initialData = [
                { id: 1, name: 'Hari', email: 'hari.cse22@mamcet.com', dept: 'CSE', batch: '2026', status: 'Verified', role: 'UIUX Designer', company: 'ABC Company' },
                { id: 2, name: 'Shalini', email: 'shalini.ece26@mamcet.com', dept: 'ECE', batch: '2026', status: 'Pending', role: 'Frontend Developer', company: 'Google' },
                { id: 3, name: 'Kumar', email: 'kumar.it22@mamcet.com', dept: 'IT', batch: '2025', status: 'Verified', role: 'Software Engineer', company: 'Amazon' },
                { id: 4, name: 'Deepak', email: 'deepak.mech22@mamcet.com', dept: 'MECH', batch: '2026', status: 'Pending', role: 'Production Engineer', company: 'Tesla' },
                { id: 5, name: 'Priya', email: 'priya.eee22@mamcet.com', dept: 'EEE', batch: '2024', status: 'Verified', role: 'Data Scientist', company: 'Microsoft' },
                { id: 6, name: 'Arjun', email: 'arjun.civil22@mamcet.com', dept: 'CIVIL', batch: '2026', status: 'Pending', role: 'Site Engineer', company: 'L&T' }
            ];
            setAlumniList(initialData);
            localStorage.setItem('alumniData', JSON.stringify(initialData));
        }
    }, []);

    const handleAction = (alumni) => {
        if (alumni.status === 'Pending') {
            navigate('/admin/review-application', { state: { alumni } });
        } else {
            navigate('/admin/view-profile', { state: { alumni } });
        }
    };

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            <AdminNavbar />
            <div className="container py-5 text-center">
                <h3 className="fw-bold mb-4" style={{ color: '#b22222' }}>Alumni Management</h3>
                
                {/* Search Bar */}
                <div className="d-flex justify-content-center mb-3">
                    <div className="input-group w-75 shadow-sm border rounded-pill overflow-hidden bg-white">
                        <span className="input-group-text bg-white border-0 ps-3">
                            <i className="fas fa-search text-muted"></i>
                        </span>
                        <input 
                            type="text" 
                            className="form-control border-0 shadow-none px-2 py-2" 
                            placeholder="Search ......" 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="d-flex justify-content-center gap-2 mb-4">
                    <select className="form-select w-auto rounded shadow-sm small text-muted"><option>Batch</option></select>
                    <select className="form-select w-auto rounded shadow-sm small text-muted"><option>Department</option></select>
                    <select className="form-select w-auto rounded shadow-sm small text-muted"><option>Year</option></select>
                </div>

                {/* Table */}
                <div className="table-responsive shadow-sm border rounded bg-white">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr className="small text-muted text-uppercase" style={{ fontSize: '12px' }}>
                                <th className="py-3 text-center">Name</th>
                                <th className="text-center">Email</th>
                                <th className="text-center">Department</th>
                                <th className="text-center">Batch</th>
                                <th className="text-center">Status</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '14px' }}>
                            {alumniList
                                .filter(al => al.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((al) => (
                                <tr key={al.id}>
                                    <td className="fw-bold">{al.name}</td>
                                    <td className="text-muted">{al.email}</td>
                                    <td>{al.dept}</td>
                                    <td>{al.batch}</td>
                                    <td>
                                        <span className={`badge rounded-pill ${al.status === 'Verified' ? 'bg-primary' : 'bg-danger'}`} 
                                              style={{ padding: '6px 12px', minWidth: '85px' }}>
                                            {al.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn btn-link text-decoration-none fw-bold p-0" 
                                                onClick={() => handleAction(al)}>
                                            {al.status === 'Verified' ? 'View' : 'Verify'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Buttons */}
                <div className="mt-4 d-flex justify-content-center gap-3">
                    <button className="btn btn-outline-dark rounded shadow-sm px-4 fw-bold">Export</button>
                    <button className="btn btn-danger rounded shadow-sm px-4 fw-bold">Add Alumni</button>
                </div>
            </div>
        </div>
    );
};

export default AlumniManagement;
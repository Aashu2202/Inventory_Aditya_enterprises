import React, { useState } from 'react';
import axios from 'axios';
import {
    Database,
    Download,
    Upload,
    ShieldCheck,
    AlertTriangle,
    FileJson,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import '../styles/Backup.css';

const Backup = () => {
    const [loading, setLoading] = useState(false);
    const [lastBackup, setLastBackup] = useState(null);

    const handleExport = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/backup/export');
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(response.data, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `AE_Inventory_Backup_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();

            setLastBackup(new Date().toLocaleString());
        } catch (error) {
            console.error('Backup failed:', error);
            alert('Failed to generate backup.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="backup-container">
            <div className="page-header">
                <div className="header-info">
                    <h1>Backup & Maintenance</h1>
                    <p>Secure your business data and manage system state</p>
                </div>
            </div>

            <div className="backup-grid">
                <div className="backup-card main">
                    <div className="b-card-icon">
                        <Database size={32} />
                    </div>
                    <h2>Database Export</h2>
                    <p>Generate a complete backup of all products, sales, inventory, and supplier data in JSON format.</p>

                    <div className="backup-status">
                        <div className="status-item">
                            <ShieldCheck size={18} className="success-icon" />
                            <span>System Status: Healthy</span>
                        </div>
                        {lastBackup && (
                            <div className="status-item">
                                <CheckCircle2 size={18} className="success-icon" />
                                <span>Last Export: {lastBackup}</span>
                            </div>
                        )}
                    </div>

                    <button
                        className="primary-btn wide"
                        onClick={handleExport}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="spinning" size={20} /> : <Download size={20} />}
                        <span>{loading ? 'Generating Backup...' : 'Download Full Backup'}</span>
                    </button>
                </div>

                <div className="backup-card secondary">
                    <div className="b-card-icon warning">
                        <Upload size={32} />
                    </div>
                    <h2>Data Restore</h2>
                    <p>Restore the database from a previously generated JSON file. </p>

                    <div className="warning-box">
                        <AlertTriangle size={20} />
                        <span>Warning: Restoring data will overwrite the current database state. This action is irreversible.</span>
                    </div>

                    <button className="secondary-btn wide disabled" disabled>
                        <span>Restore Coming Soon</span>
                    </button>
                </div>
            </div>

            <div className="maintenance-info">
                <h3>Recommended Best Practices</h3>
                <ul>
                    <li>Generate a backup at the end of every business day.</li>
                    <li>Store backup files in a secure cloud location (Google Drive/OneDrive).</li>
                    <li>Do not modify the generated JSON file manually.</li>
                </ul>
            </div>
        </div>
    );
};

export default Backup;

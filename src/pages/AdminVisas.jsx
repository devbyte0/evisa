// components/AdminVisas.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../apiClient';

export default function AdminVisas() {
  const [visas, setVisas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const formatDateDMY = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    fetchVisas();
  }, []);

  const fetchVisas = async () => {
    try {
      const response = await apiClient.get('/visa/all');
      const data = response.data;

      if (data.success) {
        setVisas(data.data);
      } else {
        setError('Nu s-au putut încărca vizele');
      }
    } catch (err) {
      setError('Eroare la încărcarea vizelor');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, visaNumber) => {
    if (!window.confirm(`Sigur doriți să ștergeți viza ${visaNumber}?`)) {
      return;
    }

    try {
      await apiClient.delete(`/visa/${id}`);
      setVisas(visas.filter(v => v._id !== id));
    } catch (err) {
      alert('Eroare la ștergerea vizei');
    }
  };

  // Filter visas
  const filteredVisas = visas.filter(visa => {
    const matchesSearch = 
      visa.visaNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visa.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visa.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visa.passportNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && visa.status.toLowerCase() === filter.toLowerCase();
  });

  if (loading) return <div className="admin-loading">Se încarcă...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-visas">
      <div className="admin-header">
        <h1>Lista Vize</h1>
        <div className="admin-nav-links">
          
          <Link to="/" className="admin-nav-link">Înapoi la site</Link>
          <Link to="/admin/visas/create" className="admin-btn-primary">+ Adaugă Viză Nouă</Link>
        </div>
      </div>

      <div className="admin-filters">
        <input
          type="text"
          placeholder="Caută după număr viză, nume, prenume, pașaport..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-search-input"
        />
        
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="admin-filter-select"
        >
          <option value="all">Toate vizele</option>
          <option value="valid">Vize valide</option>
          <option value="expired">Vize expirate</option>
          <option value="cancelled">Vize anulate</option>
          <option value="pending">Vize în așteptare</option>
        </select>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Număr Viză</th>
              <th>Nume</th>
              <th>Prenume</th>
              <th>Pașaport</th>
              <th>Naționalitate</th>
              <th>Tip Viză</th>
              <th>Status</th>
              <th>Emisă la</th>
              <th>Expiră la</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisas.map(visa => (
              <tr key={visa._id}>
                <td><strong>{visa.visaNumber}</strong></td>
                <td>{visa.lastName}</td>
                <td>{visa.firstName}</td>
                <td>{visa.passportNumber}</td>
                <td>{visa.nationality}</td>
                <td>{visa.visaType}</td>
                <td>
                  <span className={`status-badge ${visa.status.toLowerCase()}`}>
                    {visa.status}
                  </span>
                </td>
                <td>{formatDateDMY(visa.issueDate)}</td>
                <td>{formatDateDMY(visa.expiryDate)}</td>
                <td>
                  <Link to={`/admin/visas/edit/${visa._id}`} className="action-btn edit-btn">Editează</Link>
                  <button onClick={() => handleDelete(visa._id, visa.visaNumber)} className="action-btn delete-btn">Șterge</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredVisas.length === 0 && (
        <div className="no-results">Nu s-au găsit vize</div>
      )}
    </div>
  );
}
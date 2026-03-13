// pages/AdminEditVisa.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import apiClient from '../apiClient';

export default function AdminEditVisa() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [formData, setFormData] = useState({
    visaNumber: '',
    passportNumber: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    visaType: 'Tourist',
    status: 'Valid',
    issueDate: '',
    expiryDate: '',
    entries: 'Single',
    purposeOfVisit: ''
  });

  useEffect(() => {
    fetchVisaData();
  }, [id]);

  const fetchVisaData = async () => {
    try {
      const response = await apiClient.get(`/visa/${id}`);
      const data = response.data;

      if (data.success) {
        const visa = data.data;
        // Format dates for input fields as dd/MM/yyyy
        const formatDateForInput = (value) => {
          if (!value) return '';
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return '';
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };

        setFormData({
          visaNumber: visa.visaNumber || '',
          passportNumber: visa.passportNumber || '',
          firstName: visa.firstName || '',
          lastName: visa.lastName || '',
          dateOfBirth: visa.dateOfBirth ? formatDateForInput(visa.dateOfBirth) : '',
          nationality: visa.nationality || '',
          visaType: visa.visaType || 'Tourist',
          status: visa.status || 'Valid',
          issueDate: visa.issueDate ? formatDateForInput(visa.issueDate) : '',
          expiryDate: visa.expiryDate ? formatDateForInput(visa.expiryDate) : '',
          entries: visa.entries || 'Single',
          purposeOfVisit: visa.purposeOfVisit || ''
        });

        // Set current photo if exists
        if (visa.photo) {
          setCurrentPhoto(visa.photo);
          setImagePreview(visa.photo.url);
        }
      } else {
        setError('Nu s-a putut încărca viza');
      }
    } catch (err) {
      setError('Eroare la încărcarea vizei');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return null;

    const imageFormData = new FormData();
    imageFormData.append('photo', selectedFile);

    try {
      setUploading(true);
      const response = await apiClient.post(
        '/upload/visa-photo',
        imageFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const data = response.data;

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Eroare la încărcarea imaginii');
      }
    } catch (err) {
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let photoData = currentPhoto;
      
      // Upload new image if selected
      if (selectedFile) {
        try {
          photoData = await uploadImage();
        } catch (uploadErr) {
          setError('Eroare la încărcarea imaginii: ' + uploadErr.message);
          setLoading(false);
          return;
        }
      }

      // Prepare visa data with photo
      const visaData = {
        ...formData,
        ...(photoData && { photo: photoData })
      };

      const response = await apiClient.put(`/visa/${id}`, visaData);
      const data = response.data;

      if (data.success) {
        navigate('/admin/visas');
      } else {
        setError(data.message || 'Eroare la actualizarea vizei');
      }
    } catch (err) {
      setError('Eroare la actualizarea vizei');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setCurrentPhoto(null);
  };

  if (fetchLoading) return <div className="admin-loading">Se încarcă datele vizei...</div>;

  return (
    <div className="admin-form-container">
      <div className="admin-header">
        <h1>Editează Viză</h1>
        <div className="admin-nav-links">
          
          <Link to="/visas" className="admin-nav-link">Lista Vize</Link>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <form onSubmit={handleSubmit} className="admin-form">
        {/* Image Upload Section */}
        <div className="form-section">
          <h3>Fotografie</h3>
          <div className="image-upload-container">
            {imagePreview ? (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button 
                  type="button" 
                  className="remove-image-btn"
                  onClick={handleRemoveImage}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <input
                  type="file"
                  id="photo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <label htmlFor="photo" className="file-label">
                  <span className="upload-icon">📷</span>
                  <span>Încarcă fotografie</span>
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Număr Viză *</label>
            <input
              type="text"
              name="visaNumber"
              value={formData.visaNumber}
              onChange={handleChange}
              required
              placeholder="Ex: VISA001"
            />
          </div>

          <div className="form-group">
            <label>Număr Pașaport *</label>
            <input
              type="text"
              name="passportNumber"
              value={formData.passportNumber}
              onChange={handleChange}
              required
              placeholder="Ex: AB123456"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Nume *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Prenume *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Data Nașterii *</label>
            <input
              type="text"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              placeholder="dd/mm/yyyy"
              required
            />
          </div>

          <div className="form-group">
            <label>Naționalitate *</label>
            <input
              type="text"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              required
              placeholder="Ex: Română"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Tip Viză *</label>
            <select name="visaType" value={formData.visaType} onChange={handleChange} required>
              <option value="Tourist">Turist</option>
              <option value="Business">Business</option>
              <option value="Student">Student</option>
              <option value="Work">Muncă</option>
              <option value="Transit">Tranzit</option>
              <option value="Diplomatic">Diplomatică</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status *</label>
            <select name="status" value={formData.status} onChange={handleChange} required>
              <option value="Valid">Validă</option>
              <option value="Expired">Expirată</option>
              <option value="Cancelled">Anulată</option>
              <option value="Pending">În așteptare</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Data Emiterii *</label>
            <input
              type="text"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleChange}
              placeholder="dd/mm/yyyy"
              required
            />
          </div>

          <div className="form-group">
            <label>Data Expirării *</label>
            <input
              type="text"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              placeholder="dd/mm/yyyy"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Intrări *</label>
            <select name="entries" value={formData.entries} onChange={handleChange} required>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Multiple">Multiple</option>
            </select>
          </div>

          <div className="form-group">
            <label>Scopul Vizitei *</label>
            <input
              type="text"
              name="purposeOfVisit"
              value={formData.purposeOfVisit}
              onChange={handleChange}
              required
              placeholder="Ex: Turism, Afaceri, etc."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin/visas')} className="admin-btn-secondary">
            Anulează
          </button>
          <button type="submit" disabled={loading || uploading} className="admin-btn-primary">
            {uploading ? 'Se încarcă imaginea...' : loading ? 'Se salvează...' : 'Salvează Modificările'}
          </button>
        </div>
      </form>
    </div>
  );
}
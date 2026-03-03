import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../apiClient';

export default function AdminCreateVisa() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

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

  // =========================
  // Handle Input Change
  // =========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // =========================
  // Handle File Selection
  // =========================
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // =========================
  // Upload Image (Axios)
  // =========================
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

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Eroare la încărcarea imaginii');
      }
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
    }
  };

  // =========================
  // Handle Submit
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let photoData = null;

      // Upload image first if exists
      if (selectedFile) {
        try {
          photoData = await uploadImage();
        } catch (uploadErr) {
          setError('Eroare la încărcarea imaginii: ' + uploadErr.message);
          setLoading(false);
          return;
        }
      }

      const visaData = {
        ...formData,
        ...(photoData && { photo: photoData })
      };

      const response = await apiClient.post(
        '/visa/create',
        visaData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        navigate('/admin/visas');
      } else {
        setError(response.data.message || 'Eroare la crearea vizei');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la crearea vizei');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-container">
      <div className="admin-header">
        <h1>Adaugă Viză Nouă</h1>
        <div className="admin-nav-links">
          
          <Link to="/admin/visas" className="admin-nav-link">Lista Vize</Link>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <form onSubmit={handleSubmit} className="admin-form">

        {/* Image Upload */}
        <div className="form-section">
          <h3>Fotografie</h3>
          <div className="image-upload-container">
            {imagePreview ? (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => {
                    setSelectedFile(null);
                    setImagePreview(null);
                  }}
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

        {/* Visa + Passport */}
        <div className="form-row">
          <div className="form-group">
            <label>Număr Viză *</label>
            <input
              type="text"
              name="visaNumber"
              value={formData.visaNumber}
              onChange={handleChange}
              required
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
            />
          </div>
        </div>

        {/* Name */}
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

        {/* Dates */}
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
            />
          </div>
        </div>

        {/* Visa Details */}
        <div className="form-row">
          <div className="form-group">
            <label>Tip Viză *</label>
            <select name="visaType" value={formData.visaType} onChange={handleChange}>
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
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="Valid">Validă</option>
              <option value="Expired">Expirată</option>
              <option value="Cancelled">Anulată</option>
              <option value="Pending">În așteptare</option>
            </select>
          </div>
        </div>

        {/* Issue + Expiry */}
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

        {/* Entries + Purpose */}
        <div className="form-row">
          <div className="form-group">
            <label>Intrări *</label>
            <select name="entries" value={formData.entries} onChange={handleChange}>
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
            />
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/visas')}
            className="admin-btn-secondary"
          >
            Anulează
          </button>

          <button
            type="submit"
            disabled={loading || uploading}
            className="admin-btn-primary"
          >
            {uploading
              ? 'Se încarcă imaginea...'
              : loading
              ? 'Se salvează...'
              : 'Salvează Viză'}
          </button>
        </div>

      </form>
    </div>
  );
}